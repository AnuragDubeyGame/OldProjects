using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UIElements;

public class PlayerInput : MonoBehaviour
{
    public event Action OnTargetHit;
    private Target target;
    [SerializeField] GameObject HitEffect, mouseCursor;
    [SerializeField] Vector3 offset;
    [SerializeField] public AudioClip TargetHitSFX, TargetMissSFX, ButtonClickSFX, HealthDecrementSFX, ConfirmSFX;
    [SerializeField] public AudioSource audiosource;
    [SerializeField] private float Accuracy = 0, BestReactionTime = 10, AverageReactionTime = 10;
    [SerializeField] private TextMeshProUGUI AccuracyDisplay, BestReactionDisplay, AverageReactionDisplay, LifeTimeBestReactionTimeDisplay, LifeTimeBestAccuracyDisplay;
    private int NoOfAttempts, NoOfSuccesfulHits;
    public float startTime, timewhenHit, reactionTime;
    public float TotalReactionTime = 0;
    private float LifeTimeBestReactionTime, LifeTimeBestAccuracy;
    private Camera cam;
    private void Start()
    {
        cam = Camera.main;
        UnityEngine.Cursor.visible = false;
        target = FindObjectOfType<Target>();
        LifeTimeBestReactionTime = PlayerPrefs.GetFloat("LifeTimeBestReactionTime");
        if (LifeTimeBestReactionTime == 0)
        {
            PlayerPrefs.SetFloat("LifeTimeBestReactionTime", 10);
        }
        LifeTimeBestAccuracy = PlayerPrefs.GetFloat("LifeTimeBestAccuracy");
    }
    void Update()
    {
        Vector3 pos = cam.ScreenToWorldPoint(Input.mousePosition);
        pos.z = 0;
        pos = pos + offset;
        mouseCursor.transform.position = pos;
        if (Input.GetMouseButtonDown(0) && target.IsGameInProgress)
        {
            Ray ray = cam.ScreenPointToRay(Input.mousePosition);
            RaycastHit2D hit = Physics2D.Raycast(ray.origin, ray.direction);

            if (hit.collider != null)
            {
                audiosource.PlayOneShot(TargetHitSFX);
                GameObject _hitEffect = Instantiate(HitEffect, hit.collider.gameObject.transform.position, Quaternion.Euler(-90, 0, 0));
                Destroy(_hitEffect, 1f);
                timewhenHit = Time.time;
                reactionTime = timewhenHit - startTime;
                TotalReactionTime += reactionTime;
                if (BestReactionTime > reactionTime)
                {
                    BestReactionTime = reactionTime;
                    print("BestReaction : " + BestReactionTime);
                }
                if (OnTargetHit != null) { OnTargetHit(); }
                NoOfAttempts++;
                NoOfSuccesfulHits++;
            }
            else
            {
                if (target.IsGameInProgress && !target.IsDeathMenu)
                {
                    audiosource.PlayOneShot(TargetMissSFX);
                }
                NoOfAttempts++;
            }
        }
    }
    public void CalculateAccuracy()
    {
        Accuracy = ((float)NoOfSuccesfulHits / (float)NoOfAttempts) * 100;
        AccuracyDisplay.text = $"Accuracy : {Accuracy}%";
        if (PlayerPrefs.GetFloat("LifeTimeBestAccuracy") < Accuracy)
        {
            PlayerPrefs.SetFloat("LifeTimeBestAccuracy", Accuracy);
        }
        LifeTimeBestAccuracyDisplay.text = $"LifeTime Best Accuracy : {PlayerPrefs.GetFloat("LifeTimeBestAccuracy")}%";
        CalculateReactionTimes();
    }
    public void CalculateReactionTimes()
    {
        AverageReactionTime = TotalReactionTime / NoOfAttempts;
        BestReactionDisplay.text = $"BestReactionTime : {BestReactionTime}s";
        if (BestReactionTime < PlayerPrefs.GetFloat("LifeTimeBestReactionTime"))
        {
            PlayerPrefs.SetFloat("LifeTimeBestReactionTime", BestReactionTime);
            print("Updated LifeTime BestReaction to " + BestReactionTime);
        }
        LifeTimeBestReactionTimeDisplay.text = $"LifeTime Best ReactionTime : {PlayerPrefs.GetFloat("LifeTimeBestReactionTime")}s";
        AverageReactionDisplay.text = $"AverageReactionTime : {AverageReactionTime}s";
    }
    public void ResetStats()
    {
        Accuracy = 0;
        BestReactionTime = 10;
        AverageReactionTime = 10;
        NoOfAttempts = 0;
        NoOfSuccesfulHits = 0;
        TotalReactionTime = 0;
    }
    public void DeleteSavedData()
    {
        PlayerPrefs.SetFloat("LifeTimeBestReactionTime", 10);
        PlayerPrefs.SetFloat("LifeTimeBestAccuracy", 0);
        LifeTimeBestAccuracyDisplay.text = $"LifeTime Best Accuracy : {PlayerPrefs.GetFloat("LifeTimeBestAccuracy")}%";
        LifeTimeBestReactionTimeDisplay.text = $"LifeTime Best ReactionTime : {PlayerPrefs.GetFloat("LifeTimeBestReactionTime")}s";
    }
}


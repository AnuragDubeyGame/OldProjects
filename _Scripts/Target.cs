using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Windows;

public class Target : MonoBehaviour
{
    public float speed = 5.0f;
    public float speedIncrement;
    Vector3 direction;
    public Color ZeroOpacityColor;
    public List<GameObject> healths;
    public GameObject DeathMenu, GameCanvas, MainMenuCanvas, ConfirmMenu;
    PlayerInput pInput;
    public bool IsGameInProgress = false;
    public bool IsDeathMenu = false;
    private void Start()
    {
        pInput = FindObjectOfType<PlayerInput>();
        pInput.OnTargetHit += Respawn;
        StartMainMenu();
    }

    void Update()
    {
        transform.position += direction * speed * Time.deltaTime;
        if (transform.position.x > 8.45f || transform.position.x < -8.45f ||
            transform.position.y > 4.25f || transform.position.y < -4.25f)
        {

            SubscractHealth();
            pInput.audiosource.PlayOneShot(pInput.HealthDecrementSFX);
            Respawn();
        }
    }

    void Respawn()
    {
        pInput.startTime = Time.time;
        transform.position = new Vector2(Random.Range(-6, 6), Random.Range(-3, 3));

        float angle = Random.Range(0.0f, 360.0f);
        direction = new Vector3(Mathf.Cos(angle),Mathf.Sin(angle),0);

        direction.Normalize();

        speed += speedIncrement * Time.deltaTime;
    }
    public void StartGame()
    {
        IsDeathMenu = false;
        pInput.audiosource.PlayOneShot(pInput.ButtonClickSFX);

        DeathMenu.SetActive(false);
        FullHealth();
        GameCanvas.SetActive(true);
        MainMenuCanvas.SetActive(false);
        pInput.ResetStats();
        Respawn();
        transform.GetComponent<Renderer>().enabled = true;
        speed = 3;
        IsGameInProgress = true;
    }
    void StartDeathScreen()
    {
        IsDeathMenu = true;
        speed = 0;
        transform.GetComponent<Renderer>().enabled = false;
        DeathMenu.SetActive(true);
        pInput.CalculateAccuracy();

    }
    public void StartMainMenu()
    {
        IsDeathMenu = false;
        pInput.audiosource.PlayOneShot(pInput.ButtonClickSFX);
        GameCanvas.SetActive(false);
        MainMenuCanvas.SetActive(true);
        IsGameInProgress = false;
        transform.position = Vector2.zero;
        transform.GetComponent<Renderer>().enabled = true;

    }
    void FullHealth()
    {
        foreach (var item in healths)
        {
            item.GetComponent<RawImage>().color = Color.black;
        }
        
    }
    void SubscractHealth()
    {
        if(healths[healths.Count-1].GetComponent<RawImage>().color == ZeroOpacityColor)
        {
            if (healths[healths.Count-2].GetComponent<RawImage>().color == ZeroOpacityColor)
            {
                healths[healths.Count - 3].GetComponent<RawImage>().color = ZeroOpacityColor;
                transform.GetComponent<Renderer>().enabled = false;
                Invoke("StartDeathScreen",0.05f);
                print("Game OVER");
            }
            else
            {
                healths[healths.Count-2].GetComponent<RawImage>().color = ZeroOpacityColor;
            }
        }
        else
        {
            healths[healths.Count-1].GetComponent<RawImage>().color = ZeroOpacityColor;
        }
    }
    public void DeleteSavedData()
    {
        pInput.audiosource.PlayOneShot(pInput.ButtonClickSFX);
        ConfirmMenu.SetActive(true);
        DeathMenu.SetActive(false);
    }
    public void Delete()
    {
        pInput.audiosource.PlayOneShot(pInput.ConfirmSFX);
        pInput.DeleteSavedData();
        DeathMenu.SetActive(true);
        ConfirmMenu.SetActive(false);
    }
    public void CancelGoBack()
    {
        pInput.audiosource.PlayOneShot(pInput.ButtonClickSFX);
        DeathMenu.SetActive(true);
        ConfirmMenu.SetActive(false);
    }
}

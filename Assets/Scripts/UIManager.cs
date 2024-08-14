using LootLocker.Requests;
using LootLocker;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    public event Action<string, float> OnScoreSubmit;
    public event Action<List<TextMeshProUGUI>> OnShowLeaderboard;

    [SerializeField] private GameObject _instuction;
    [SerializeField] private GameObject _deathMenu;
    [SerializeField] private GameObject _restartButton;
    [SerializeField] private GameObject _scoreUI;

    [SerializeField] private Button _submitButton;
    [SerializeField] private TMP_InputField _playerNameInputField;

    [SerializeField] private List<TextMeshProUGUI> _entriesFields = new List<TextMeshProUGUI>();
    LeaderboardManager _leaderboardManager;
    private int _isFirstTime;
    private float _timeSurvived;

    void Start()
    {
        _isFirstTime = PlayerPrefs.GetInt("IsFirstTime", 0);
        GameManager.Instance.OnStateChange += Instance_OnStateChange;
        _leaderboardManager = FindObjectOfType<LeaderboardManager>();
        _restartButton.GetComponent<Button>().onClick.AddListener(RestartGame);
    }

    private void RestartGame()
    {
        SceneManager.LoadScene(0);
    }

    private void Instance_OnStateChange(GameState obj)
    {
        if(obj == GameState.Idle)
        {
            StartCoroutine(ChangeGameObjectVisisbility(_instuction, true,0));
            StartCoroutine(ChangeGameObjectVisisbility(_deathMenu, false, 0));
            StartCoroutine(ChangeGameObjectVisisbility(_submitButton.gameObject, false,0));
            StartCoroutine(ChangeGameObjectVisisbility(_playerNameInputField.gameObject, false,0));
            _timeSurvived = 0f;
        }
        else if(obj == GameState.Running)
        {
            StartCoroutine(ChangeGameObjectVisisbility(_instuction, false,0));
            StartCoroutine(ChangeGameObjectVisisbility(_deathMenu, false,0));
            StartCoroutine(ChangeGameObjectVisisbility(_submitButton.gameObject, false,0));
            StartCoroutine(ChangeGameObjectVisisbility(_playerNameInputField.gameObject, false,0));

        }
        else if(obj == GameState.Death)
        {
            StartCoroutine(ChangeGameObjectVisisbility(_instuction, false,0));
            StartCoroutine(ChangeGameObjectVisisbility(_deathMenu, true,0.45f));
            StartCoroutine(ChangeGameObjectVisisbility(_submitButton.gameObject, true,0));
            _leaderboardManager.FetchLeaderboardData(_entriesFields);
            if (_isFirstTime == 0)
            {
                StartCoroutine(ChangeGameObjectVisisbility(_playerNameInputField.gameObject, true,0));
            }
            CalculateScore();
            OnShowLeaderboard?.Invoke(_entriesFields);

        }
    }
    private void Update()
    {
        if(GameManager.Instance.gameState== GameState.Running)
        {
            _timeSurvived += Time.deltaTime;
        }
    }
    private void CalculateScore()
    {
        _timeSurvived = Mathf.Round(_timeSurvived * 100f) / 100f;
        _scoreUI.GetComponent<TextMeshProUGUI>().text = $" Score : {_timeSurvived}s";
    }
    public void SubmitScore()
    {
        StartCoroutine(SubmitScoreRoutine());
    }
    public IEnumerator SubmitScoreRoutine()
    {
        if (_isFirstTime == 0)
        {
            if(_playerNameInputField.text.Length > 0)
            {
                print("Submitting Score...");
                OnScoreSubmit?.Invoke(_playerNameInputField.text, _timeSurvived);
                PlayerPrefs.SetString("PlayerName", _playerNameInputField.text);
                LootLockerSDKManager.SetPlayerName(_playerNameInputField.text, (response1) => {
                    if (response1.success)
                    {
                        Debug.Log($"Player Name Set as {_playerNameInputField.text}");
                        PlayerPrefs.SetInt("IsFirstTime", 1);
                    }
                    else
                    {
                        Debug.Log($"Failed to set player name {response1.Error}");
                    }

                });
            }
            else
            {
                Debug.Log("Enter a Valid Name");
                yield break;
            }
        }
        else
        {
            print("Submitting Score...");
            OnScoreSubmit?.Invoke(PlayerPrefs.GetString("PlayerName"), _timeSurvived);
        }

    }
    private IEnumerator ChangeGameObjectVisisbility(GameObject obj, bool val, float Delay)
    {
        yield return new WaitForSeconds(Delay);
        if(val)
        {
            obj.gameObject.SetActive(true);
        }
        else
        {
            obj.gameObject.SetActive(false);

        }
    }
}

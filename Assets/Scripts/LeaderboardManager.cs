using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using LootLocker.Requests;
using Mono.Cecil.Cil;
using UnityEditor;
using System.Threading.Tasks;
using TMPro;

public class LeaderboardManager : MonoBehaviour
{
    private const string _leaderboardID = "timesurvived_leaderboard";
    private const int _maxScores = 5;

    UIManager _uiManager;

    private void Start()
    {
        _uiManager = FindObjectOfType<UIManager>();
        _uiManager.OnScoreSubmit += UiManager_OnScoreSubmit;
        _uiManager.OnShowLeaderboard += UiManager_OnShowLeaderboard;
    }

    private void UiManager_OnShowLeaderboard(List<TextMeshProUGUI> _entriesFields)
    {
        FetchLeaderboardData(_entriesFields);
    }

    private void UiManager_OnScoreSubmit(string playerName, float _timeSurvived)
    {
        print($"Score Submitted for {playerName} with Score : {_timeSurvived}");

        LootLockerSDKManager.SubmitScore(playerName, (int)_timeSurvived, _leaderboardID, (response) =>
        {
            if (response.statusCode == 200)
            {
                Debug.Log("Successfully Added Score to the LeaderBoard");
            }
            else
            {
                Debug.Log("failed: " + response.Error);
            }
        });
    }
    public void FetchLeaderboardData(List<TextMeshProUGUI> entries)
    {
        LootLockerSDKManager.GetScoreList(_leaderboardID, _maxScores, 0, (response) =>
        {
            if (response.statusCode == 200)
            {
                Debug.Log("Successful");
                LootLockerLeaderboardMember[] scores = response.items;
                for (int i = 0; i < scores.Length; i++)
                {
                    entries[i].text = $"{scores[i].rank}. {scores[i].player.name} : {scores[i].score}";
                }
                if(scores.Length < _maxScores)
                {
                    for (int i = scores.Length; i < _maxScores; i++)
                    {
                        entries[i].text = $"{i+1}. Unknown";
                    }
                }
            }
            else
            {
                Debug.Log("failed: " + response.Error);
            }
        });
    }
/*    [MenuItem("Developer / ClearData")]
    public static void ClearSaveDat()
    {
        PlayerPrefs.DeleteAll();
        print("Cleared All saved Data");
    }*/
}

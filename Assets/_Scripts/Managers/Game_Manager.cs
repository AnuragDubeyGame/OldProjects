using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Game_Manager : MonoBehaviour
{
    #region SINGLETONS
    public static Game_Manager Instance;
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(this.gameObject);
        }
    }
    #endregion

    public event Action<GameState> OnAfterGameStateChange;
   
    public GameState state;

    private void Start()
    {
        UpdateGameState(GameState.MainMenu);
    }

    public void UpdateGameState(GameState newState)
    {
        state = newState;
        switch (newState)
        {
            case GameState.MainMenu:
                HandleMainMenu();
                break;
            case GameState.Idle:
                HandleIdleState();
                break;
            case GameState.Running:
                HandleRunningState();
                break;
            case GameState.Paused:
                HandlePausedMenu();
                break;
            case GameState.Death:
                HandleDeathState();
                break;
            case GameState.Finished:
                HandleFinishedSate();
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(newState), newState, null);

        }

        OnAfterGameStateChange?.Invoke(newState);
    }

    private void HandleFinishedSate()
    {
        print("Transitioned To Finished State");
    }

    private void HandleDeathState()
    {
        print("Transitioned To Death State");
    }

    private void HandlePausedMenu()
    {
        print("Transitioned To Paused State");
    }

    private void HandleRunningState()
    {
        print("Transitioned To Running State");
    }

    private void HandleIdleState()
    {
        print("Transitioned To Idle State");
    }

    private void HandleMainMenu()
    {
        print("Transitioned To MainMenu State");
    }
}
public enum GameState{
    MainMenu,
    Idle,
    Running,
    Paused,
    Death,
    Finished,
}
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SoundManager : MonoBehaviour
{

    [SerializeField] private Feedback_Base _gameStartFeedback;
    [SerializeField] private Feedback_Base _gameDeathFeedback;
    [SerializeField] private Feedback_Base _clickFeedback;
    [SerializeField] private AudioSource _bgMusic;

    void Start()
    {
        GameManager.Instance.OnStateChange += Instance_OnStateChange;
    }

    private void Instance_OnStateChange(GameState obj)
    {
        if (obj == GameState.Idle)
        {
            _bgMusic.Stop();
        }
        else if (obj == GameState.Running)
        {
            _gameStartFeedback.Play();
            StartCoroutine(PlayBGMusic());
        }
        else if (obj == GameState.Death)
        {
            _gameDeathFeedback.Play();
            _bgMusic.Stop();
        }
    }
    private IEnumerator PlayBGMusic()
    {
        yield return new WaitForSeconds(0.5f);
        _bgMusic.Play();
    }
    public void OnButtonClick()
    {
        _clickFeedback.Play();
    }
}

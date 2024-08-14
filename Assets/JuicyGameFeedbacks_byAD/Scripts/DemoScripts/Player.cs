using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{
    public enum PlayerState
    {
        grounded,
        air
    }
    private Rigidbody rb;
    [SerializeField] float JumpForce;
    PlayerState state;

    [SerializeField] private Feedback_Base JumpFeedback;

    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        state = PlayerState.grounded;
    }
    public void OnPlayerJumped()
    {
        print("Player Jumped");
    }
    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space) && state == PlayerState.grounded)
        {
            JumpFeedback.Play();
            #region JUmpLogic
            state = PlayerState.air;
            rb.AddForce(Vector3.up * JumpForce, ForceMode.Impulse);
            StartCoroutine(setstatetogrounded());
            #endregion
        }
    }
    private IEnumerator setstatetogrounded()
    {
        yield return new WaitForSeconds(1f);
        state = PlayerState.grounded;
    }
}

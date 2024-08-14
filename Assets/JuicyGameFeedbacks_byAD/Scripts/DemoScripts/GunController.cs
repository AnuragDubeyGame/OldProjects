using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GunController : MonoBehaviour
{
    public enum GunState
    {
        fired,
        ready
    }
    GunState state;
    [SerializeField] private Feedback_Base gunfireFeedback;
    private void Start()
    {
        state = GunState.ready;
    }
    void Update()
    {
        if(Input.GetMouseButtonDown(0) && state == GunState.ready)
        {
            state= GunState.fired;
            gunfireFeedback.Play();
            StartCoroutine(BeReadyToFire());
            //Gun Fire Logic
        }
    }
    IEnumerator BeReadyToFire()
    {
        yield return new WaitForSeconds(.45f);
        state = GunState.ready;
    }
    public void OnFire()
    {
        Debug.Log("Gun Fired");
    }
}

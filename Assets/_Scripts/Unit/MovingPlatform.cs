using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MovingPlatform : MonoBehaviour
{
    public bool X, Y, Z;
    public float Speed;
    public float Distance;
    private Vector3 sp;
    private void Start()
    {
        sp = transform.position;
    }
  
    private void Update()
    {
        if (X)
        {
            transform.position = sp + new Vector3(Mathf.Sin(Time.time * Speed) * Distance,0f,0f);
        }else if (Y)
        {
            transform.position = sp + new Vector3(0f, Mathf.Sin(Time.time * Speed) * Distance, 0f);
        }
        else
        {
            transform.position = sp + new Vector3(0f, 0f, Mathf.Sin(Time.time * Speed) * Distance);
        }
    }
}

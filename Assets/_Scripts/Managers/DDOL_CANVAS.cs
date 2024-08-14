using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DDOL_CANVAS : MonoBehaviour
{
    public static DDOL_CANVAS Instance;
    void Awake()
    {
        DontDestroyOnLoad(this);

        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            DestroyObject(gameObject);
        }
    }
}

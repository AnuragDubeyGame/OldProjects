using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DDOL_MANAGERS : MonoBehaviour
{
    public static DDOL_MANAGERS Instance;
    void Awake()
    {
        DontDestroyOnLoad(this);

        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }
}

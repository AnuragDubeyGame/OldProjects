using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "Car")]
public class Vehicle : ScriptableObject
{
    public float Acceleration;
    public float MaxSpeed;
    public float TurnStrength;
    public float Drag;
    public float DriftForce;
    public float DriftTraction;
    public float DefaultTraction;
    public float minPitch;
    public float maxPitch;
    public float minSpeed;
    public float maxSpeed;
    public float minSpeedToEnableDriftSound;
    public float WallBumpForce;
    public float WallBumpCameraShakeIntensity;
    public float WallBumpCameraShakeFrequency;
    public float WallBumpCameraShakeTime;
    public GameObject StartVFX;
    public GameObject BumpVFX;
    public GameObject DriftVFX;
    public GameObject DeathVFX;
    public GameObject FinishVFX;
    public AudioClip DeathSFX;
    public AudioClip BumpSFX;
    public AudioClip StartSFX;
    public AudioClip FinishSFX;

}

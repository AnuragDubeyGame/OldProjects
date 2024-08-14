using System;
using System.Collections;
using System.Collections.Generic;
using Unity.Mathematics;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.SceneManagement;

public class VehicleController : MonoBehaviour
{
    public Vehicle CurrentVehicleScriptableObject;
    public PlayerInput PlayerControls;

    [SerializeField] private Transform StartVFXPOSITION;
    [SerializeField] private TrailRenderer SkidRightWheel;
    [SerializeField] private TrailRenderer SkidLeftWheel;
    [SerializeField] private ParticleSystem leftDriftSmoke;
    [SerializeField] private ParticleSystem rightDriftSmoke;

    [SerializeField] private AudioSource EngineSound_Source;
    [SerializeField] private AudioSource DriftSound_Source;
    [SerializeField] private AudioSource CarSFX_Source;

    private Rigidbody rb;
    private Vector3 MoveForce;
    private float _startTime;
    private float _endTime;
    private float _differenceTime;
    private float _turnDirection;
    private bool _isDrifting;
    private bool iscarstarted;
    private float CurrentDriftForce;
    private bool canBump = true;
    private float nextBumpTime = 0.4f;
    private float _pitchfromCar;
    private float _currentSpeed;
    private bool canDrift = false;

    private void Awake()
    {
        MainMenu_Manager.Instance.OnTapPressed += ONTAPPRESSED;
        PlayerControls = GetComponent<PlayerInput>();
        rb = GetComponent<Rigidbody>();
        if(PlayerPrefs.GetFloat($"Level{SceneManager.GetActiveScene().buildIndex}BestTime") <= 0)
        {
            PlayerPrefs.SetFloat($"Level{SceneManager.GetActiveScene().buildIndex}BestTime", 100f);
        } 
    }
    private void OnDestroy()
    {
        MainMenu_Manager.Instance.OnTapPressed -= ONTAPPRESSED;
    }
    public void ONTAPPRESSED()
    {
        _startTime = Time.time;
        Init();
        AddBoost();
        StartCar();
    }
    private void AddBoost()
    {
        CarSFX_Source.PlayOneShot(CurrentVehicleScriptableObject.StartSFX);
        var instantiatedVFX = Instantiate(CurrentVehicleScriptableObject.StartVFX, StartVFXPOSITION.position, Quaternion.identity);
        Destroy(instantiatedVFX, 3f);
    }
    private void Init()
    {
        CurrentDriftForce = CurrentVehicleScriptableObject.DefaultTraction;
        SkidRightWheel.emitting = false;
        SkidLeftWheel.emitting = false;
        EngineSound_Source.enabled = true;
        DriftSound_Source.enabled = true;
    }
    public void StartCar()
    {
        iscarstarted= true;
        rb.isKinematic = false;
        EngineSound_Source.enabled = true;
    }
    public void StopCar()
    {
        iscarstarted= false;
        rb.isKinematic= true;
        EngineSound_Source.enabled = false;
    }

    public void OnTurnMovement(InputAction.CallbackContext ctx)
    {
        _turnDirection = ctx.ReadValue<float>();
    }
    public void OnDriftMovement(InputAction.CallbackContext value)
    {
        if(Game_Manager.Instance.state == GameState.Running)
        {
            if(value.started){
                canDrift = true;
            }else if(value.canceled){
                canDrift = false;
            }
            if(value.started && _currentSpeed > CurrentVehicleScriptableObject.minSpeedToEnableDriftSound)
            {
                _isDrifting= true;
                StartEffect(true);
                DriftSound_Source.enabled = true;
                DriftSound_Source.Play();
                CurrentDriftForce = CurrentVehicleScriptableObject.DriftTraction;
            }
            else if (value.canceled || _currentSpeed < CurrentVehicleScriptableObject.minSpeedToEnableDriftSound)
            {
                _isDrifting= false;
                StartEffect(false);
                DriftSound_Source.Stop();
                DriftSound_Source.enabled = false;
                CurrentDriftForce = CurrentVehicleScriptableObject.DefaultTraction;
            }
        }
    }
    public void StartEffect(bool value)
    {
        if (value)
        {
            leftDriftSmoke.gameObject.SetActive(true);
            rightDriftSmoke.gameObject.SetActive(true);
            SkidRightWheel.gameObject.SetActive(true);
            SkidLeftWheel.gameObject.SetActive(true);
            SkidRightWheel.emitting = true;
            SkidLeftWheel.emitting = true;
            leftDriftSmoke.enableEmission = true;
            rightDriftSmoke.enableEmission = true;
        }
        else
        {
            leftDriftSmoke.gameObject.SetActive(false);
            rightDriftSmoke.gameObject.SetActive(false);
            SkidRightWheel.emitting = false;
            SkidLeftWheel.emitting = false;
            leftDriftSmoke.enableEmission = false;
            rightDriftSmoke.enableEmission = false;
        }
    }
    private void Update()
    {
        if (!iscarstarted) return;
        if ( canDrift && _currentSpeed > CurrentVehicleScriptableObject.minSpeedToEnableDriftSound && DriftSound_Source.enabled == false)
        {
            StartEffect(true);
            DriftSound_Source.enabled = true;
            DriftSound_Source.Play();
            CurrentDriftForce = CurrentVehicleScriptableObject.DriftTraction;
        }
        if (canDrift && _currentSpeed < CurrentVehicleScriptableObject.minSpeedToEnableDriftSound )
        {
            StartEffect(false);
            DriftSound_Source.Stop();
            DriftSound_Source.enabled = false;
            CurrentDriftForce = CurrentVehicleScriptableObject.DefaultTraction;
        }
        EngineSound();
    }
    private void FixedUpdate()
    {
        if (!iscarstarted) return;
        if(rb.transform.position.y < -1f)
        {
            MainMenu_Manager.Instance.Death();
        }
        if (_isDrifting)
        {
            rb.AddForce(rb.transform.right * _turnDirection * CurrentVehicleScriptableObject.DriftForce * Time.deltaTime, ForceMode.Acceleration);
        }
        rb.AddForce(-rb.transform.up * CurrentVehicleScriptableObject.Acceleration * Time.fixedDeltaTime, ForceMode.Acceleration);

        // Rotate the Rigidbody based on turn direction and turn strength
        rb.MoveRotation(rb.rotation * Quaternion.Euler(Vector3.forward * _turnDirection * CurrentVehicleScriptableObject.TurnStrength * Time.fixedDeltaTime));

        // Clamp the velocity to the maximum speed
        rb.velocity = Vector3.ClampMagnitude(rb.velocity, CurrentVehicleScriptableObject.MaxSpeed);

        // Apply drag force to the Rigidbody
        rb.AddForce(rb.velocity * -CurrentVehicleScriptableObject.Drag, ForceMode.Acceleration);

        // Interpolate the velocity towards the forward direction
        Vector3 newVelocity = Vector3.Lerp(rb.velocity.normalized, -rb.transform.up, CurrentDriftForce * Time.fixedDeltaTime) * rb.velocity.magnitude;
        rb.velocity = newVelocity;
    }
    private void OnCollisionEnter(Collision collision)
    {
        if (!iscarstarted) return;
        if (collision.gameObject.CompareTag("Finish"))
        {
            _endTime= Time.time;
            _differenceTime = _endTime - _startTime;
            DriftSound_Source.Stop();
            DriftSound_Source.enabled = false;
            EngineSound_Source.enabled = false;
            collision.gameObject.GetComponent<MeshRenderer>().material.color = Color.green;
            VehicleSpawn_Manager.Instance.ZoomIn(10f);
            CarSFX_Source.PlayOneShot(CurrentVehicleScriptableObject.FinishSFX);
            StartEffect(false);
            if (_differenceTime < PlayerPrefs.GetFloat($"Level{SceneManager.GetActiveScene().buildIndex}BestTime"))
            {
                PlayerPrefs.SetFloat($"Level{SceneManager.GetActiveScene().buildIndex}BestTime", _differenceTime);
            }
            MainMenu_Manager.Instance.CalculateTime(_differenceTime, PlayerPrefs.GetFloat($"Level{SceneManager.GetActiveScene().buildIndex}BestTime"));
            MainMenu_Manager.Instance.Finish();
        }else if (collision.gameObject.CompareTag("Death"))
        {
            DriftSound_Source.Stop();
            VehicleSpawn_Manager.Instance.ShakeCamera(1.8f,1f , 0.2f);
            var effect = Instantiate(CurrentVehicleScriptableObject.DeathVFX, transform.position, Quaternion.identity);
            Destroy(effect, 2f);
            CarSFX_Source.PlayOneShot(CurrentVehicleScriptableObject.DeathSFX);
            DriftSound_Source.enabled = false;
            EngineSound_Source.enabled = false;
            VehicleSpawn_Manager.Instance.ShakeCamera(0.75f,1f, 0.125f);
            VehicleSpawn_Manager.Instance.ZoomIn(10f);
            StartEffect(false);
            MainMenu_Manager.Instance.Death();
        }else if (collision.gameObject.CompareTag("Wall"))
        {
            VehicleSpawn_Manager.Instance.ShakeCamera(CurrentVehicleScriptableObject.WallBumpCameraShakeIntensity, CurrentVehicleScriptableObject.WallBumpCameraShakeFrequency, CurrentVehicleScriptableObject.WallBumpCameraShakeTime);
            foreach (var item in collision.contacts)
            {
                if (!canBump) return;
                CarSFX_Source.PlayOneShot(CurrentVehicleScriptableObject.BumpSFX);
                StartCoroutine(BumpCamEffect());
                var effect = Instantiate(CurrentVehicleScriptableObject.BumpVFX, item.point, Quaternion.identity);
                Destroy(effect, 2f);
                rb.AddForce(item.normal * CurrentVehicleScriptableObject.WallBumpForce * Time.deltaTime, ForceMode.Impulse);
                canBump = false;
                StartCoroutine(EnableBump());
                return;
            }
        }
        
    }
  
    private IEnumerator BumpCamEffect()
    {
        VehicleSpawn_Manager.Instance.ZoomIn(36f);
        yield return new WaitForSeconds(0.05f);
        if(Game_Manager.Instance.state != GameState.Death && Game_Manager.Instance.state != GameState.Finished)
        {
            VehicleSpawn_Manager.Instance.ZoomOut();
        }
    }
    private IEnumerator EnableBump()
    {
        yield return new WaitForSeconds(nextBumpTime);
        canBump = true;
    }
    private void EngineSound()
    {
        _currentSpeed = rb.velocity.magnitude;
        _pitchfromCar = rb.velocity.magnitude / 50f;
        //print($"Current Speed : {_currentSpeed}");
        if (_currentSpeed < CurrentVehicleScriptableObject.minSpeed)
        {
            EngineSound_Source.pitch = Mathf.Lerp(EngineSound_Source.pitch,CurrentVehicleScriptableObject.minPitch, Time.deltaTime * 10f);
        }
        if(_currentSpeed > CurrentVehicleScriptableObject.minSpeed && _currentSpeed < CurrentVehicleScriptableObject.maxSpeed)
        {
            EngineSound_Source.pitch = Mathf.Lerp(EngineSound_Source.pitch, CurrentVehicleScriptableObject.minPitch + _pitchfromCar, Time.deltaTime * 10f);
        }
        if(_currentSpeed > CurrentVehicleScriptableObject.maxSpeed)
        {
            EngineSound_Source.pitch = Mathf.Lerp(EngineSound_Source.pitch, CurrentVehicleScriptableObject.maxPitch, Time.deltaTime * 10f); 
        }
    }
}

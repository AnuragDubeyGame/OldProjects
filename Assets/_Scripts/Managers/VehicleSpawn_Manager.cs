using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Cinemachine;
using System;
using System.Net.NetworkInformation;
using UnityEngine.SceneManagement;
using Unity.Mathematics;
using UnityEngine.UI;

public class VehicleSpawn_Manager : MonoBehaviour
{
    #region SINGLETONS
    public static VehicleSpawn_Manager Instance;
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(this.gameObject);
        }
    }
    private void Start()
    {
        Game_Manager.Instance.OnAfterGameStateChange += GameManagerOnAfterGameStateChange;
        MainMenu_Manager.Instance.OnRestart += OnRestart;
    }

    private void OnDestroy()
    {
        Game_Manager.Instance.OnAfterGameStateChange -= GameManagerOnAfterGameStateChange;
        MainMenu_Manager.Instance.OnRestart -= OnRestart;
    }
    #endregion
    [SerializeField] private Vehicle[] VehicleScriptableObjects;
    public Transform VehicleSpawnPos;
    private CinemachineFreeLook _camera;
    public CinemachineBasicMultiChannelPerlin shakeCamera;
    private int SpawnedCarIndex;
    public static GameObject CarInstantiated;
    private Rigidbody rb;
    private float _shaketimer;

    private void GameManagerOnAfterGameStateChange(GameState obj)
    {
        if (obj == GameState.Idle)
        {
            VehicleSpawnPos = FindObjectOfType<VehicleSpawnPosition_Ref>().transform;
            if(CarInstantiated == null)
            {
                SpawnVehicle();
            }
        }
        if (obj == GameState.Paused)
        {
            CarInstantiated.GetComponent<VehicleController>().StopCar();
        }
        if(obj == GameState.Running)
        {
            CarInstantiated.GetComponent<VehicleController>().StartCar();
        }
        if(obj == GameState.Death)
        {
            CarInstantiated.GetComponent<VehicleController>().StopCar();
        }
        if(obj == GameState.Finished)
        {
            CarInstantiated.GetComponent<VehicleController>().StopCar();
        }
    }
    public void SpawnVehicle()
    {
        print($"Instantiating Car");
        SpawnedCarIndex = MainMenu_Manager.LastSelectedCar;
        _camera = FindObjectOfType<CinemachineFreeLook>();
        shakeCamera = _camera.GetRig(1).GetCinemachineComponent<CinemachineBasicMultiChannelPerlin>();
        CarInstantiated = Instantiate(MainMenu_Manager.Instance.Vehicles[SpawnedCarIndex], VehicleSpawnPos.position, Quaternion.identity);
        CarInstantiated.GetComponent<VehicleController>().CurrentVehicleScriptableObject = VehicleScriptableObjects[SpawnedCarIndex];
        CarInstantiated.transform.rotation = (Quaternion.Euler(-90,0,0));
        _camera.Follow = CarInstantiated.transform;
        _camera.LookAt = CarInstantiated.transform;
        var offset = CarInstantiated.GetComponent<Rigidbody>().rotation * new Vector3(0, 0, -10);
        _camera.ForceCameraPosition(CarInstantiated.GetComponent<Rigidbody>().position + offset, CarInstantiated.GetComponent<Rigidbody>().rotation);
        ZoomOut();
    }
    private void OnRestart()
    {
        RespawnCar();
        var offset = CarInstantiated.GetComponent<Rigidbody>().rotation * new Vector3(0, 0, -10);
        _camera.ForceCameraPosition(CarInstantiated.GetComponent<Rigidbody>().position + offset, CarInstantiated.GetComponent<Rigidbody>().rotation);
    }
    public void RespawnCar()
    {
        if (CarInstantiated != null)
        {
            Destroy(CarInstantiated);
            SpawnVehicle();
        }
    }
    public void ShakeCamera(float _intensity, float _frequency,float _time)
    {
        shakeCamera.m_AmplitudeGain = _intensity;
        shakeCamera.m_FrequencyGain = _frequency;
        _shaketimer = _time;
    }
    public void ZoomIn(float ZoomValue)
    {
        _camera.m_Lens.FieldOfView = ZoomValue;
    }
    public void ZoomOut()
    {
        _camera.m_Lens.FieldOfView = 30f;
    }
    public void Update()
    {
        if (_shaketimer > 0)
        {
            _shaketimer -= Time.deltaTime;
            if(_shaketimer <= 0)
            {
                shakeCamera.m_AmplitudeGain = 0;
                shakeCamera.m_FrequencyGain = 0;
            }
        }
    }
   
}

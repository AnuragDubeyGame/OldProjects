using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using TMPro;
using UnityEngine;
using UnityEditor;
using UnityEngine.Audio;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Linq;
using UnityEngine.UIElements;

public class MainMenu_Manager : MonoBehaviour
{
    #region SINGLETONS

    public static MainMenu_Manager Instance;
    private void Awake()
    {
        if(Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(this.gameObject);
        }
    }

    #endregion
    public event Action OnTapPressed;
    public event Action OnRestart;

    [SerializeField] GameObject MainMenu_Canvas;
    [SerializeField] GameObject Game_Canvas;
    [SerializeField] GameObject Control_Canvas;
    [SerializeField] GameObject Pause_Canvas;
    [SerializeField] GameObject Death_Canvas;
    [SerializeField] GameObject Finish_Canvas;
    [SerializeField] GameObject LevelSelect_Canvas;
    [SerializeField] GameObject Settings_Canvas;
    [SerializeField] GameObject Customize_Canvas;
    [SerializeField] GameObject GameEnd_Canvas;
    [SerializeField] GameObject TAPTOSTART_DISPLAY;
    [SerializeField] TextMeshProUGUI CURRENTLEVELSELECTED_DISPLAY;
    [SerializeField] TextMeshProUGUI CURRENTCAR_DISPLAY;
    [SerializeField] TextMeshProUGUI CURRENTFINISHTIME_DISPLAY;
    [SerializeField] TextMeshProUGUI BESTFINISHTIME_DISPLAY;
    [SerializeField] UnityEngine.UI.Slider MusicSlider, SFXSlider;
    [SerializeField] TMPro.TMP_Dropdown GraphicSetting;
    [SerializeField] Transform VehicleHolder;
    [SerializeField] private AudioMixer audioMixer;

    [SerializeField] private AudioSource MenuaudioSource;
    [SerializeField] private AudioSource MenuBackGrounMusic;
    [SerializeField] private AudioSource GameBackGrounMusic;
    [SerializeField] private AudioClip BackButtonClick_SFX_MENU;
    [SerializeField] private AudioClip ButtonClick_SFX_MENU;
    [SerializeField] private AudioClip CarSpawn_SFX_MENU;
    [SerializeField] private AudioClip CarSelect_SFX_MENU;
    [SerializeField] private AudioClip StartGame_SFX_GAME;



    [SerializeField] private int MaxLevel;
    private static int LastLevelReached;
    private int CurrentSelectedLevel;
    private bool isRestarting = false;
    public List<GameObject> Vehicles;
    private GameObject CurrentSpawnedVehicle;
    [HideInInspector] public static int LastSelectedCar;
    private int CurrentSelectedCar;

    private void OnEnable()
    {
        Game_Manager.Instance.OnAfterGameStateChange += GameManagerOnAfterGameStateChange;
        LastLevelReached = PlayerPrefs.GetInt("LastLevelReached") != 0 ? PlayerPrefs.GetInt("LastLevelReached") : 1;
        LastSelectedCar = PlayerPrefs.GetInt("LastSelectedCar") != 0 ? PlayerPrefs.GetInt("LastSelectedCar") : 0;
        LastLevelReached = Math.Clamp(LastLevelReached, 1, MaxLevel - 1);
        CurrentSelectedCar = LastSelectedCar;
        CurrentSelectedLevel = LastLevelReached;
        CURRENTLEVELSELECTED_DISPLAY.text = $"{CurrentSelectedLevel}";
    }
    private void FetchSavedData()
    {
        if (PlayerPrefs.GetInt("DataSaved") != 0)
        {
            MusicSlider.value = PlayerPrefs.GetFloat("MasterVolume");
            SFXSlider.value = PlayerPrefs.GetFloat("SFXVolume");
            SetGraphicsQuality(PlayerPrefs.GetInt("Quality"));
            GraphicSetting.value = (PlayerPrefs.GetInt("Quality"));
        }
        else
        {

            ResetToDefault();
        }
    }
    private void OnDestroy()
    {
        Game_Manager.Instance.OnAfterGameStateChange -= GameManagerOnAfterGameStateChange;
    }
    private void Start()
    {
        StartCoroutine(SpawnNewVehicle(true));
        CURRENTCAR_DISPLAY.text = $"{CurrentSpawnedVehicle.name}";
    }
    private void GameManagerOnAfterGameStateChange(GameState obj)
    {
        if(obj == GameState.MainMenu)
        {
            ShowMainMenu(true);
            ShowGameMenu(false);
            ShowControlMenu(false);
            ShowPauseMenu(false);
            ShowDeathMenu(false);
            ShowFinishMenu(false);
            ShowLevelSelectMenu(false);
            ShowSettingsMenu(false);
            ShowCustomizeMenu(false);
            ShowGameEndMenu(false);
            VehicleHolder = FindObjectOfType<VehicleHolder_Ref>().transform;
            MenuBackGrounMusic.enabled = true;
            MenuBackGrounMusic.Play();
            GameBackGrounMusic.enabled = false;            
            StartCoroutine(SpawnNewVehicle(true));
            FetchSavedData();
        }
        else if(obj == GameState.Idle)
        {
            ShowGameMenu(true);
            ShowTapToStart_Display(true);
            ShowMainMenu(false);
            ShowControlMenu(false);
            ShowPauseMenu(false);
            ShowDeathMenu(false);
            ShowFinishMenu(false);
            ShowLevelSelectMenu(false);
            ShowSettingsMenu(false);
            ShowCustomizeMenu(false);
            ShowGameEndMenu(false);
            GameBackGrounMusic.enabled = true;
            MenuBackGrounMusic.Pause();
            FetchSavedData();
            InvokeRepeating("ListenForTap", 0.25f, 0.01f); 
        }else if (obj == GameState.Running)
        {
            ShowControlMenu(true);
            ShowTapToStart_Display(false);
            ShowPauseMenu(false);
            ShowGameEndMenu(false);
            FetchSavedData();
        }
        else if (obj == GameState.Paused)
        {
            ShowPauseMenu(true);
            ShowControlMenu(false);
            ShowGameEndMenu(false);
            GameBackGrounMusic.Pause();
        }
        else if (obj == GameState.Death)
        {
            ShowDeathMenu(true);
            ShowControlMenu(false);
            ShowGameEndMenu(false);
        }
        else if (obj == GameState.Finished)
        {
            ShowDeathMenu(false);
            ShowFinishMenu(true);
            ShowControlMenu(false);
            ShowGameEndMenu(false);
        }
    }

    public void Continue()
    {
        MenuaudioSource.PlayOneShot(StartGame_SFX_GAME);
        StartCoroutine(LoadSceneAsync(LastLevelReached));
        
    }
    public void Pause()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        Game_Manager.Instance.UpdateGameState(GameState.Paused);
    }
    public void Resume()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        GameBackGrounMusic.Play();
        Game_Manager.Instance.UpdateGameState(GameState.Running);
    }
    public void Restart()
    {
        print("Restart");
        isRestarting = true;
        MenuaudioSource.PlayOneShot(StartGame_SFX_GAME);
        LoadSceneAsync(SceneManager.GetActiveScene().buildIndex);
        Game_Manager.Instance.UpdateGameState(GameState.Idle);
        OnRestart?.Invoke();
    }
    public void StartNextLevel()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        if (((SceneManager.GetActiveScene().buildIndex) + 1) == MaxLevel)
        {
            print($" ---------------------- GAME ENDED -----------------");
            ShowGameEndMenu(true);
        }
        else
        {
            StartCoroutine(LoadSceneAsync((SceneManager.GetActiveScene().buildIndex) + 1));
        }
    }
    public void Home()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        StartCoroutine(LoadSceneAsync(-1));
    }
    public void Death()
    {
        Game_Manager.Instance.UpdateGameState(GameState.Death);
    }
    public void Finish()
    {
        Game_Manager.Instance.UpdateGameState(GameState.Finished);
        if (SceneManager.GetActiveScene().buildIndex <= MaxLevel - 1)
        {
            LastLevelReached = SceneManager.GetActiveScene().buildIndex + 1;
            LastLevelReached = Math.Clamp(LastLevelReached, 1, MaxLevel - 1);
            print("LastLevelReached"+LastLevelReached);
            PlayerPrefs.SetInt("LastLevelReached", LastLevelReached + 1);
        }
        else 
        {
            LastLevelReached = SceneManager.GetActiveScene().buildIndex;
            LastLevelReached = Math.Clamp(LastLevelReached, 1, MaxLevel - 1);
            print("LastLevelReached"+LastLevelReached);
            PlayerPrefs.SetInt("LastLevelReached", LastLevelReached);
        }
    }
    public void CalculateTime(float TimeFinishedIn, float BestTime)
    {
        CURRENTFINISHTIME_DISPLAY.text = $"FINISHED IN : {TimeFinishedIn}s";
        BESTFINISHTIME_DISPLAY.text = $"BEST TIME : {BestTime}s";

    }
    public void SelectNextLevel()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        CurrentSelectedLevel = (CurrentSelectedLevel + 1) % MaxLevel;
        if (CurrentSelectedLevel <= 0) CurrentSelectedLevel = 1;
        CURRENTLEVELSELECTED_DISPLAY.text = $"{CurrentSelectedLevel}";
    }
    public void SelectPreviousLevel()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        CurrentSelectedLevel = (CurrentSelectedLevel - 1) % MaxLevel;
        if (CurrentSelectedLevel == 0) CurrentSelectedLevel = MaxLevel - 1;
        CURRENTLEVELSELECTED_DISPLAY.text = $"{CurrentSelectedLevel}";
    }
    public void PlaySelectedLevel()
    {
        MenuaudioSource.PlayOneShot(StartGame_SFX_GAME);
        StartCoroutine(LoadSceneAsync(CurrentSelectedLevel));
    }

    public void SelectNextCar()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        CurrentSelectedCar = (CurrentSelectedCar + 1) % Vehicles.Count;
        StartCoroutine(SpawnNewVehicle(false));
        MenuaudioSource.PlayOneShot(CarSpawn_SFX_MENU);
        CURRENTCAR_DISPLAY.text = $"{CurrentSpawnedVehicle.name}";
    }
    public void SelectPreviousCar()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        if (CurrentSelectedCar == 0) CurrentSelectedCar = Vehicles.Count;
        CurrentSelectedCar = (CurrentSelectedCar - 1) % Vehicles.Count;
        StartCoroutine(SpawnNewVehicle(false));
        MenuaudioSource.PlayOneShot(CarSpawn_SFX_MENU);
        CURRENTCAR_DISPLAY.text = $"{CurrentSpawnedVehicle.name}";
    }
    public void SelectSelectedCar()
    {
        MenuaudioSource.PlayOneShot(CarSelect_SFX_MENU);
        PlayerPrefs.SetInt("LastSelectedCar", CurrentSelectedCar);
        LastSelectedCar = PlayerPrefs.GetInt("LastSelectedCar");
        ShowMainMenu(true);
        ShowCustomizeMenu(false);
    }
    private IEnumerator SpawnNewVehicle(bool spawnNew)
    {
        var CarIndex = spawnNew ? LastSelectedCar : CurrentSelectedCar;
        if (CurrentSelectedCar < 0) yield return null;
        if (CurrentSpawnedVehicle != null)
        {
            Destroy(CurrentSpawnedVehicle);
            var NewSpawnedVehicle = Instantiate(Vehicles[CarIndex], VehicleHolder.position, VehicleHolder.rotation);
            string input = NewSpawnedVehicle.transform.name;
            int index = input.IndexOf("(");
            if (index >= 0)
                input = input.Substring(0, index);
            NewSpawnedVehicle.transform.name = input;
            CurrentSpawnedVehicle = NewSpawnedVehicle;
        }
        else
        {
            var NewSpawnedVehicle = Instantiate(Vehicles[CarIndex], VehicleHolder.position, VehicleHolder.rotation);
            CurrentSpawnedVehicle = NewSpawnedVehicle;
        }
    }
    public void LevelSelect()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        ShowLevelSelectMenu(true);
        ShowMainMenu(false);
    }
    public void Settings()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        ShowLevelSelectMenu(false);
        ShowMainMenu(false);
        ShowSettingsMenu(true);
    }
    public void Customize()
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        ShowCustomizeMenu(true);
        ShowLevelSelectMenu(false);
        ShowMainMenu(false);
    }
    public void Back()
    {
        MenuaudioSource.PlayOneShot(BackButtonClick_SFX_MENU);
        ShowMainMenu(true);
        ShowLevelSelectMenu(false);
        ShowLevelSelectMenu(false);
        ShowCustomizeMenu(false);
        ShowSettingsMenu(false);
        StartCoroutine(SpawnNewVehicle(true));
    }
    private void ListenForTap()
    {
        if(Input.GetKeyDown(KeyCode.Space) || Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began || isRestarting)
        {
            print($"Starting the Game");
            OnTapPressed?.Invoke();
            Game_Manager.Instance.UpdateGameState(GameState.Running);
            isRestarting = false;
            CancelInvoke();
        }
    }
    public void SetMasterVolume(float volume)
    {
        audioMixer.SetFloat("MasterVolume", volume);
        PlayerPrefs.SetFloat("MasterVolume", volume);
        PlayerPrefs.SetInt("DataSaved", 1);
        PlayerPrefs.Save();
    }
    public void SetSFXVolume(float volume)
    {
        audioMixer.SetFloat("SFXVolume", volume);
        PlayerPrefs.SetFloat("SFXVolume", volume);
        PlayerPrefs.SetInt("DataSaved", 1);
        PlayerPrefs.Save();
    }
    public void ResetToDefault()
    {
        print("Resetiing SETTINGS");
        audioMixer.SetFloat("MasterVolume", -2.2f);
        audioMixer.SetFloat("SFXVolume", -7.8f);
        MusicSlider.value = -2.3f;
        SFXSlider.value = -7.8f;
        QualitySettings.SetQualityLevel(2);
        GraphicSetting.value = 2;
        PlayerPrefs.SetInt("Quality", 2);
        PlayerPrefs.SetInt("DataSaved", 1);
    }
    public void SetGraphicsQuality(int index)
    {
        MenuaudioSource.PlayOneShot(ButtonClick_SFX_MENU);
        QualitySettings.SetQualityLevel(index);
        PlayerPrefs.SetInt("Quality", index);
        PlayerPrefs.SetInt("DataSaved", 1);
        PlayerPrefs.Save();
    }
    public void ShowTapToStart_Display(bool value)
    {
        if (value) { TAPTOSTART_DISPLAY.SetActive(true); } else { TAPTOSTART_DISPLAY.SetActive(false); } 
    }
    public void ShowMainMenu(bool value)
    {
        if (value) { MainMenu_Canvas.SetActive(true); } else { MainMenu_Canvas.SetActive(false); }
    }
    public void ShowGameMenu(bool value)
    {
        if (value) { Game_Canvas.SetActive(true); } else { Game_Canvas.SetActive(false); }
    }
    public void ShowControlMenu(bool value)
    {
        if (value) { Control_Canvas.SetActive(true); } else { Control_Canvas.SetActive(false); }
    }
    public void ShowPauseMenu(bool value)
    {
        if (value) { Pause_Canvas.SetActive(true); } else { Pause_Canvas.SetActive(false); }
    }
    public void ShowDeathMenu(bool value)
    {
        if (value) { Death_Canvas.SetActive(true); } else { Death_Canvas.SetActive(false); }
    }
    public void ShowFinishMenu(bool value)
    {
        if (value) { Finish_Canvas.SetActive(true); } else { Finish_Canvas.SetActive(false); }
    }
    public void ShowLevelSelectMenu(bool value)
    {
        if (value) { LevelSelect_Canvas.SetActive(true); } else { LevelSelect_Canvas.SetActive(false); }
    }
    public void ShowSettingsMenu(bool value)
    {
        if (value) { Settings_Canvas.SetActive(true); } else { Settings_Canvas.SetActive(false); }
    }
    public void ShowGameEndMenu(bool value)
    {

        if (value) { GameEnd_Canvas.SetActive(true); ShowFinishMenu(false); } else { GameEnd_Canvas.SetActive(false); }
    }
    public void ShowCustomizeMenu(bool value)
    {
        if (value) { Customize_Canvas.SetActive(true); } else { Customize_Canvas.SetActive(false); }
    }
    private IEnumerator LoadSceneAsync(int levelNo)
    {
        if (levelNo == -1)
        {
            var MainMenuprogress = SceneManager.LoadSceneAsync(0, LoadSceneMode.Single);
            while (!MainMenuprogress.isDone)
            {
                yield return null;
            }
            Game_Manager.Instance.UpdateGameState(GameState.MainMenu);
            yield return null;
        }
        else
        {
            levelNo = levelNo == 0 ? LastLevelReached : levelNo;
            var progress = SceneManager.LoadSceneAsync($"Level{levelNo}",  LoadSceneMode.Single);
            while(!progress.isDone)
            {
                yield return null;
            }
            Game_Manager.Instance.UpdateGameState(GameState.Idle);
        }
    }
    [MenuItem("Developer / ClearData")]
    public static void ClearPlayerPrefsData()
    {
        PlayerPrefs.DeleteAll();
        Debug.Log("CLEARED ALL SAVED DATA");
    }
}

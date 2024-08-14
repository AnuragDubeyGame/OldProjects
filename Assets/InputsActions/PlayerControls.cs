//------------------------------------------------------------------------------
// <auto-generated>
//     This code was auto-generated by com.unity.inputsystem:InputActionCodeGenerator
//     version 1.4.4
//     from Assets/InputsActions/PlayerControls.inputactions
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Utilities;

public partial class @PlayerControls : IInputActionCollection2, IDisposable
{
    public InputActionAsset asset { get; }
    public @PlayerControls()
    {
        asset = InputActionAsset.FromJson(@"{
    ""name"": ""PlayerControls"",
    ""maps"": [
        {
            ""name"": ""DrivingMovement"",
            ""id"": ""025506a3-c053-4ce4-ab4d-a7bac337ed4b"",
            ""actions"": [
                {
                    ""name"": ""Turn"",
                    ""type"": ""Value"",
                    ""id"": ""dc9b6f5c-1127-427c-b210-390bbaf0c222"",
                    ""expectedControlType"": ""Axis"",
                    ""processors"": """",
                    ""interactions"": """",
                    ""initialStateCheck"": true
                },
                {
                    ""name"": ""Drift"",
                    ""type"": ""Button"",
                    ""id"": ""46a5c5e8-beda-49b8-9190-0df9c0a5c644"",
                    ""expectedControlType"": ""Button"",
                    ""processors"": """",
                    ""interactions"": """",
                    ""initialStateCheck"": false
                }
            ],
            ""bindings"": [
                {
                    ""name"": ""1D Axis"",
                    ""id"": ""71eb8158-a76e-4ef8-b63e-3c747157e8b9"",
                    ""path"": ""1DAxis"",
                    ""interactions"": """",
                    ""processors"": """",
                    ""groups"": """",
                    ""action"": ""Turn"",
                    ""isComposite"": true,
                    ""isPartOfComposite"": false
                },
                {
                    ""name"": ""negative"",
                    ""id"": ""36cc72ff-4f5a-4ee6-9755-ad4a928a7e1d"",
                    ""path"": ""<Keyboard>/a"",
                    ""interactions"": """",
                    ""processors"": """",
                    ""groups"": """",
                    ""action"": ""Turn"",
                    ""isComposite"": false,
                    ""isPartOfComposite"": true
                },
                {
                    ""name"": ""positive"",
                    ""id"": ""905011db-ed3e-45bc-b43f-4fa4bc6ab8a5"",
                    ""path"": ""<Keyboard>/d"",
                    ""interactions"": """",
                    ""processors"": """",
                    ""groups"": """",
                    ""action"": ""Turn"",
                    ""isComposite"": false,
                    ""isPartOfComposite"": true
                },
                {
                    ""name"": """",
                    ""id"": ""4d9f576d-7d3c-45f7-a836-bf53bd1cf11a"",
                    ""path"": ""<Keyboard>/space"",
                    ""interactions"": """",
                    ""processors"": """",
                    ""groups"": """",
                    ""action"": ""Drift"",
                    ""isComposite"": false,
                    ""isPartOfComposite"": false
                }
            ]
        }
    ],
    ""controlSchemes"": []
}");
        // DrivingMovement
        m_DrivingMovement = asset.FindActionMap("DrivingMovement", throwIfNotFound: true);
        m_DrivingMovement_Turn = m_DrivingMovement.FindAction("Turn", throwIfNotFound: true);
        m_DrivingMovement_Drift = m_DrivingMovement.FindAction("Drift", throwIfNotFound: true);
    }

    public void Dispose()
    {
        UnityEngine.Object.Destroy(asset);
    }

    public InputBinding? bindingMask
    {
        get => asset.bindingMask;
        set => asset.bindingMask = value;
    }

    public ReadOnlyArray<InputDevice>? devices
    {
        get => asset.devices;
        set => asset.devices = value;
    }

    public ReadOnlyArray<InputControlScheme> controlSchemes => asset.controlSchemes;

    public bool Contains(InputAction action)
    {
        return asset.Contains(action);
    }

    public IEnumerator<InputAction> GetEnumerator()
    {
        return asset.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public void Enable()
    {
        asset.Enable();
    }

    public void Disable()
    {
        asset.Disable();
    }
    public IEnumerable<InputBinding> bindings => asset.bindings;

    public InputAction FindAction(string actionNameOrId, bool throwIfNotFound = false)
    {
        return asset.FindAction(actionNameOrId, throwIfNotFound);
    }
    public int FindBinding(InputBinding bindingMask, out InputAction action)
    {
        return asset.FindBinding(bindingMask, out action);
    }

    // DrivingMovement
    private readonly InputActionMap m_DrivingMovement;
    private IDrivingMovementActions m_DrivingMovementActionsCallbackInterface;
    private readonly InputAction m_DrivingMovement_Turn;
    private readonly InputAction m_DrivingMovement_Drift;
    public struct DrivingMovementActions
    {
        private @PlayerControls m_Wrapper;
        public DrivingMovementActions(@PlayerControls wrapper) { m_Wrapper = wrapper; }
        public InputAction @Turn => m_Wrapper.m_DrivingMovement_Turn;
        public InputAction @Drift => m_Wrapper.m_DrivingMovement_Drift;
        public InputActionMap Get() { return m_Wrapper.m_DrivingMovement; }
        public void Enable() { Get().Enable(); }
        public void Disable() { Get().Disable(); }
        public bool enabled => Get().enabled;
        public static implicit operator InputActionMap(DrivingMovementActions set) { return set.Get(); }
        public void SetCallbacks(IDrivingMovementActions instance)
        {
            if (m_Wrapper.m_DrivingMovementActionsCallbackInterface != null)
            {
                @Turn.started -= m_Wrapper.m_DrivingMovementActionsCallbackInterface.OnTurn;
                @Turn.performed -= m_Wrapper.m_DrivingMovementActionsCallbackInterface.OnTurn;
                @Turn.canceled -= m_Wrapper.m_DrivingMovementActionsCallbackInterface.OnTurn;
                @Drift.started -= m_Wrapper.m_DrivingMovementActionsCallbackInterface.OnDrift;
                @Drift.performed -= m_Wrapper.m_DrivingMovementActionsCallbackInterface.OnDrift;
                @Drift.canceled -= m_Wrapper.m_DrivingMovementActionsCallbackInterface.OnDrift;
            }
            m_Wrapper.m_DrivingMovementActionsCallbackInterface = instance;
            if (instance != null)
            {
                @Turn.started += instance.OnTurn;
                @Turn.performed += instance.OnTurn;
                @Turn.canceled += instance.OnTurn;
                @Drift.started += instance.OnDrift;
                @Drift.performed += instance.OnDrift;
                @Drift.canceled += instance.OnDrift;
            }
        }
    }
    public DrivingMovementActions @DrivingMovement => new DrivingMovementActions(this);
    public interface IDrivingMovementActions
    {
        void OnTurn(InputAction.CallbackContext context);
        void OnDrift(InputAction.CallbackContext context);
    }
}

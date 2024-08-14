using UnityEditor;
using UnityEngine;

[CustomPropertyDrawer(typeof(Feedback_Base.CameraShakeSettings))]
public class CameraShakeSettingsDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        // Get the parent object that holds the CameraShake boolean field
        SerializedObject parent = property.serializedObject;
        SerializedProperty parentCameraShake = parent.FindProperty("UseCameraShake");

        // Only display the CameraShakeSettings field in the inspector if CameraShake is true
        if (parentCameraShake.boolValue)
        {
            Rect offsetPosition = new Rect(position.x + 15, position.y, position.width, position.height);
            EditorGUI.PropertyField(offsetPosition, property, label, true);
        }
    }
    public override float GetPropertyHeight(SerializedProperty property, GUIContent label)
    {
        // Get the parent object that holds the CameraShake boolean field
        SerializedObject parent = property.serializedObject;
        SerializedProperty parentCameraShake = parent.FindProperty("UseCameraShake");

        if (parentCameraShake.boolValue)
        {
            return EditorGUI.GetPropertyHeight(property, label, true);
        }
        else
        {
            return 0;
        }
    }
}
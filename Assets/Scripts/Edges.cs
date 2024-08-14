using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class Edges : MonoBehaviour
{
    public int Weight;
    public Vertices Vertex_S;
    public Vertices Vertex_D;
    public TextMeshProUGUI WeightTextField;
    public TMP_InputField WeightInputTextField;

    private void Awake()
    {
        WeightInputTextField = FindObjectOfType<WeightInputField>().GetComponent<TMP_InputField>();
    }
    void Start()
    {
        Weight = int.Parse(WeightInputTextField.text.ToString());
    }

    public void SetWeight()
    {
        LineRenderer lr = this.GetComponent<LineRenderer>();
        var p1 = lr.GetPosition(0);
        var p2 = lr.GetPosition(1);

        WeightTextField.transform.parent.GetComponent<RectTransform>().position = ((p1 + p2) / 2);
        WeightTextField.text = Weight.ToString();
    }
}

using System.Collections;
using System.Collections.Generic;
using TMPro;
using Unity.VisualScripting;
using UnityEngine;

public class Vertices : MonoBehaviour
{
    private UserController controller;

    public bool explored = false;
    public uint index = 0;
    public float Distance = 0;
    public Vertices prevVertices = null;
    public List<Edges> connectedEdges = new List<Edges>();

    public List<Vertices> connectedVertices = new List<Vertices>();
    public TextMeshProUGUI IndexTextField;
    public TextMeshProUGUI CalculatedDistanceTextField;

    public void setIndex(uint verticesIndex)
    {
        index = verticesIndex;
        IndexTextField.text = index.ToString();
    }
    void Start()
    {
        controller = FindObjectOfType<UserController>();
    }

    private void OnMouseDown()
    {
        if(controller.selectedVertices == null)
        {
            StartEdge();
        }
        else
        {
            if(controller.selectedVertices == this || controller.selectedVertices.connectedVertices.Contains(this)) return;
            EndEdge();
        }
    }

    private void StartEdge()
    {
        controller.selectedVertices = this;
        controller.SpawnEdge(this.gameObject.transform.position);
    }

    private void EndEdge()
    {
        controller.EdgeRenderer.SetPosition(1, this.gameObject.transform.position);
        controller.TempEdge.SetWeight();
        controller.TempEdge.Vertex_S = controller.selectedVertices;
        controller.TempEdge.Vertex_D = this;
        controller.selectedVertices.connectedEdges.Add(controller.TempEdge);
        controller.selectedVertices.connectedVertices.Add(this);
        this.connectedEdges.Add(controller.TempEdge);
        this.connectedVertices.Add(controller.selectedVertices);

        controller.EdgeRenderer = null;
        controller.TempEdge = null;
        controller.selectedVertices = null;
        controller.SetRandomWeight();
    }

    private void OnMouseUp()
    {
        print($"Released from Vertices : {index}");
    }
}


using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class UserController : MonoBehaviour
{
    [Header("Camera Settings")]
    private Camera cam;
    public float MaxZoom, MinZoom, currZoom = 5, zoomSensitivity;
    public float moveSpeed = 5.0f;

    [Header("Graph Settings")]
    private Vector2 m_Position = Vector2.zero;
    private Graph graph;
    public GameObject VerticesPrefab, EdgePrefab;
    private uint verticesIndex;

    public Vertices selectedVertices;
    public Edges TempEdge;
    public LineRenderer EdgeRenderer;
    public TMP_InputField WeightInputTextField;

    private void Awake()
    {
        WeightInputTextField = FindObjectOfType<WeightInputField>().GetComponent<TMP_InputField>();
    }
    void Start()
    {
        cam = Camera.main;
        graph = FindAnyObjectByType<Graph>();
    }

    void Update()
    {
        handleCameraZoom();
        handleCameraMovement();
        m_Position = Input.mousePosition;
        m_Position = cam.ScreenToWorldPoint(m_Position);
        

        if (Input.GetMouseButtonDown(1) && selectedVertices == null)
        {
            handlePlacement();
        }
        if(selectedVertices != null && TempEdge != null && Input.GetMouseButtonDown(1))
        {
            Destroy(TempEdge.gameObject);
            TempEdge = null;
            selectedVertices = null;
        }
        if(EdgeRenderer != null)
        {
            EdgeRenderer.SetPosition(1,m_Position);
        }
    }
    private void handleCameraZoom()
    {
        if(cam != null)
        {
            currZoom -= Input.GetAxis("Mouse ScrollWheel") * zoomSensitivity * Time.deltaTime;
            currZoom = Mathf.Clamp(currZoom, MinZoom, MaxZoom);
            cam.orthographicSize = currZoom;
        }
    }
    private void handleCameraMovement()
    {
        float horizontalInput = Input.GetAxis("Horizontal");
        float verticalInput = Input.GetAxis("Vertical");

        float currX = cam.transform.position.x + horizontalInput * moveSpeed * Time.deltaTime;
        float currY = cam.transform.position.y + verticalInput * moveSpeed * Time.deltaTime;

        cam.transform.position = new Vector3(currX,currY,-10);  
    }
    private void handlePlacement()
    {
        GameObject spawnedObject = Instantiate(VerticesPrefab, m_Position, Quaternion.identity);
        spawnedObject.GetComponent<Vertices>().setIndex(verticesIndex);
        spawnedObject.transform.name = $"Vertice {verticesIndex}";
        graph.verticesList.Add(spawnedObject.GetComponent<Vertices>());
        if (verticesIndex == 0)
        {
            graph.Source_vertices = spawnedObject.GetComponent<Vertices>();
            graph.Source_vertices.GetComponent<SpriteRenderer>().color = Color.cyan;
        }
        else
        {
            if(graph.Destination_vertices != null)
            {
                graph.Destination_vertices.GetComponent<SpriteRenderer>().color = Color.white;
            }
            graph.Destination_vertices = spawnedObject.GetComponent<Vertices>();
            graph.Destination_vertices.GetComponent<SpriteRenderer>().color = Color.yellow;
        }

        verticesIndex++;
    }
    public void SpawnEdge(Vector2 startPos)
    {
        GameObject tempEdge = Instantiate(EdgePrefab);
        TempEdge = tempEdge.GetComponent<Edges>();
        EdgeRenderer = TempEdge.GetComponent<LineRenderer>();
        TempEdge.GetComponent<LineRenderer>().SetPosition(0, startPos);
    }
    public void SetRandomWeight()
    {
        WeightInputTextField.text = Random.Range(1, 51).ToString();
    }
}


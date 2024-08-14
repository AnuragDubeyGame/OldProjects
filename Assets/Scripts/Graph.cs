using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Graph : MonoBehaviour
{
    public List<Vertices> verticesList;

    public Vertices Source_vertices;
    public Vertices Destination_vertices;
    Vertices leastDistancedVertex = null;
    float leastDistance = Mathf.Infinity;

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            CalculateShortestDistance();
        }
    }

    bool allVerticesExplored()
    {
        if(Destination_vertices.explored) return true;
        foreach (var v in verticesList)
        {
            if (!v.explored) return false;
        }
        return true;
    }

    void Relaxation(Vertices src, Edges edge)
    {
        var calculatedDistance = src.Distance + edge.Weight;

        if (calculatedDistance < edge.Vertex_D.Distance)
        {
            edge.Vertex_D.Distance = calculatedDistance;
            edge.Vertex_D.prevVertices = src;
            edge.Vertex_D.CalculatedDistanceTextField.text = calculatedDistance.ToString();
        }
    }

    Vertices FindNextLeastValuedVertex()
    {
        foreach (var v in verticesList)
        {
            if (!v.explored)
            {
                if (v.Distance < leastDistance)
                {
                    leastDistance = v.Distance;
                    leastDistancedVertex = v;
                }
            }
        }
        return leastDistancedVertex;
    }

    void CalculateShortestDistance()
    {
        if (Destination_vertices.connectedEdges.Count == 0)
        {
            Debug.Log($"Np path to the destination Vertex : {Destination_vertices.index}");
            return;
        }

        foreach (var vertex in verticesList)
        {
            vertex.explored = false;
            vertex.prevVertices = null;
            vertex.Distance = Mathf.Infinity;
        }

        print("Calculating....");
        Source_vertices.Distance = 0;
        Source_vertices.explored = true;

        while (!allVerticesExplored())
        {
            foreach (var edge in Source_vertices.connectedEdges)
            {
                if (!edge.Vertex_D.explored)
                {
                    Relaxation(Source_vertices, edge);
                }
            }
            Source_vertices = FindNextLeastValuedVertex();
            Source_vertices.explored = true;
            if (Destination_vertices != Source_vertices)
            {
                Source_vertices.GetComponent<SpriteRenderer>().color = Color.gray;
            }
            leastDistance = Mathf.Infinity;
        }

        print($"Done. \n Showing Results ...");

        List<uint> Path = new List<uint>();
        Vertices currVer = Destination_vertices;
        Path.Add(currVer.index);

        while (currVer.prevVertices != null)
        {
            Path.Add(currVer.prevVertices.index);

            foreach (var edge in currVer.connectedEdges)
            {
                if (edge.Vertex_S == currVer.prevVertices)
                {
                    print($"Painting {edge.name} To Green");
                    edge.GetComponent<LineRenderer>().startColor = (Color.green);
                    edge.GetComponent<LineRenderer>().endColor = (Color.green);
                }
            }
            currVer = currVer.prevVertices;
        }
        string ShortedPath = "";
        foreach (var vertex in Path)
        {
            ShortedPath += ($"-> {vertex} ");
        }
        print(ShortedPath);
    }

}

// https://neerajadh.gitlab.io/graph-playground/#

/*
 For each vertex v:
	Dist[v] = infinite
	Prev[v] = none
Dist source = 0
Set all vertices to unexplored

While destination not explored:
V = least valued unexplored vortex
Set v to explored
For each edge (v, w):
	If dist[v] + len(v, w) < dist[w]:
	Dist[w] = dist[v] + len[v, w]
Prev[w] = v
 */
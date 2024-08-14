using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float _movementSpeed;
    [SerializeField] float _minX = -5f;
    [SerializeField] float _minY = -5f;
    [SerializeField] float _maxX = 5f;
    [SerializeField] float _maxY = 5f;
   
    void Update()
    {
        float horizontalInput = Input.GetAxisRaw("Horizontal");
        float verticalInput = Input.GetAxisRaw("Vertical");

        if (GameManager.Instance.gameState == GameState.Idle)
        {
            if (horizontalInput != 0f || verticalInput != 0f)
            {
                GameManager.Instance.UpdateGameState(GameState.Running);
            }
        }

        if (GameManager.Instance.gameState == GameState.Running)
        {
            Vector3 movementDirection = new Vector3(horizontalInput, verticalInput, 0);
            movementDirection.Normalize();

            Vector3 newPosition = transform.position + movementDirection * Time.deltaTime * _movementSpeed;

            newPosition.x = Mathf.Clamp(newPosition.x, _minX, _maxX);
            newPosition.y = Mathf.Clamp(newPosition.y, _minY, _maxY);

            transform.position = newPosition;
        }
    }
    public void Kill(string bywhom)
    {
        print($"Player Killed by {bywhom}");
        GameManager.Instance.UpdateGameState(GameState.Death);
    }

}

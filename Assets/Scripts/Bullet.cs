using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Bullet : MonoBehaviour
{
    private Rigidbody2D _rb;
    [SerializeField] private float _bulletSpeed;

    private void Start()
    {
        _rb = GetComponent<Rigidbody2D>();
        Destroy(this.gameObject, 6f);
    }
    private void FixedUpdate()
    {
        _rb.velocity = transform.up * _bulletSpeed * Time.deltaTime;
    }
    private void OnCollisionEnter2D(Collision2D collision)
    {
        if(collision.gameObject.TryGetComponent(out PlayerController player))
        {
            player.GetComponent<PlayerController>().Kill("Bullet");
            //Play Feedback
        }
        Destroy(this.gameObject, 0.05f);
    }
}

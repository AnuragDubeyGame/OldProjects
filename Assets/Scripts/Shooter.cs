using Mono.Cecil.Cil;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Shooter : MonoBehaviour
{
    [SerializeField] private GameObject _bulletPrefab;
    [SerializeField] private GameObject _muzzle;
    [SerializeField] private float _minRateOfFire;
    [SerializeField] private float _maxRateOfFire;

    private float _rateOfFire;
    private float _timeBetweenShoot;
    private bool _canRandomize = true;

    private void Start()
    {
        _rateOfFire = Random.Range(_minRateOfFire, _maxRateOfFire);
        GameManager.Instance.OnStateChange += Instance_OnStateChange;
    }
    private void Instance_OnStateChange(GameState obj)
    {
        if (obj == GameState.Running)
        {
            _timeBetweenShoot = 1f / _rateOfFire;
        }
    }
    void Update()
    {
        if (GameManager.Instance.gameState == GameState.Running)
        {
            if (_timeBetweenShoot <= 0f)
            {
                Shoot();
                _timeBetweenShoot = 1f / _rateOfFire;
                if(_canRandomize)
                {
                    _rateOfFire = Random.Range(_minRateOfFire,_maxRateOfFire);
                }
            }
            else
            {
                _timeBetweenShoot -= Time.deltaTime;
            }
        }
    }

    private void Shoot()
    {
        GameObject instantiatedBullet = Instantiate(_bulletPrefab, _muzzle.transform.position, _muzzle.transform.rotation);
    }
    public void IncreaseRateofFire()
    {
        _rateOfFire *= 2.5f;
        _canRandomize = false;
    }
    public void DecreaseRateofFire()
    {
        _rateOfFire /= 2.5f;
        _canRandomize = true;
    }
}

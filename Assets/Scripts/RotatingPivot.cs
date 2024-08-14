using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class RotatingPivot : MonoBehaviour
{
    [SerializeField] private float _rotateSpeed;
    [SerializeField] private float _minTimeBetweenEach_FasterRotation;
    [SerializeField] private float _maxTimeBetweenEach_FasterRotation;
    [SerializeField] private float _fasterRotation_Duration;

    private float _timeBetweenEach_FasterRotation;
    public AnimationCurve rotateCurve;
    private float _timer;
    private List<Shooter> _shooters = new List<Shooter>();

    private void Start()
    {
        _timer = 0f;
        _shooters = FindObjectsOfType<Shooter>().ToList();
    }

    void Update()
    {
        if (GameManager.Instance.gameState == GameState.Running)
        {
            float curveValue = rotateCurve.Evaluate(Time.time);
            Quaternion fromRotation = transform.rotation;
            Quaternion toRotation = Quaternion.AngleAxis(_rotateSpeed * Time.deltaTime, Vector3.forward) * fromRotation;
            transform.rotation = Quaternion.Slerp(fromRotation, toRotation, curveValue);


            _timer += Time.deltaTime;
            if (_timer >= _timeBetweenEach_FasterRotation)
            {
                _rotateSpeed *= 2.5f;
                foreach (Shooter shooter in _shooters)
                {
                    shooter.IncreaseRateofFire();
                }
                StartCoroutine(ResetRotationSpeed());
                _timeBetweenEach_FasterRotation = Random.Range(_minTimeBetweenEach_FasterRotation, _maxTimeBetweenEach_FasterRotation);
            }
        }
    }
    private IEnumerator ResetRotationSpeed()
    {
        _timer = 0f;
        yield return new WaitForSeconds(_fasterRotation_Duration);
        _rotateSpeed /= 2.5f;
        foreach (Shooter shooter in _shooters)
        {
            shooter.DecreaseRateofFire();
        }

    }
}

import React, { useEffect, useState } from 'react';
import './App.css';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import 'bootstrap/dist/css/bootstrap.min.css';

function PRForm(props) {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
    }
    else {
      props.submitCallback({
        press: evt.target.elements.press.value,
        bench: evt.target.elements.bench.value,
        squat: evt.target.elements.squat.value,
        deadlift: evt.target.elements.deadlift.value
      });
    }
    setValidated(true);
  }

  function getURLValue(key) {
    const fiveRepMaxesDict = Object.fromEntries(new URLSearchParams(window.location.search));
    if (fiveRepMaxesDict.hasOwnProperty(key)) {
      return fiveRepMaxesDict[key];
    }
    else {
      return null;
    }
  }

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Row>
        <Form.Group as={Col}>
          <Form.Label>Press 5 rep max</Form.Label>
          <Form.Control required name="press" type="number" placeholder="135" defaultValue={getURLValue("press")}/>
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Deadlift 5 rep max</Form.Label>
          <Form.Control required name="deadlift" type="number" placeholder="405" defaultValue={getURLValue("deadlift")}/>
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Bench 5 rep max</Form.Label>
          <Form.Control required name="bench" type="number" placeholder="225" defaultValue={getURLValue("bench")}/>
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Squat 5 rep max</Form.Label>
          <Form.Control required name="squat" type="number" placeholder="315" defaultValue={getURLValue("squat")}/>
        </Form.Group>
      </Form.Row>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" type="submit" style={{marginLeft: "auto"}}>
          Submit
        </Button>
      </div>
    </Form>
  );
}

function WeekTableColumn(props) {
  const barWeight = 45.0;
  const weightRatiosByWeek = [
    [
      ["5", 0.4],
      ["5", 0.5],
      ["3", 0.6],
      ["5", 0.65],
      ["5", 0.75],
      ["5+", 0.85],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5]
    ],
    [
      ["5", 0.4],
      ["5", 0.5],
      ["3", 0.6],
      ["3", 0.7],
      ["3", 0.8],
      ["3+", 0.9],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5]
    ],
    [
      ["5", 0.4],
      ["5", 0.5],
      ["3", 0.6],
      ["5", 0.75],
      ["3", 0.85],
      ["1+", 0.95],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5],
      ["10", 0.5]
    ],
    [
      ["5", 0.4],
      ["5", 0.5],
      ["5", 0.6]
    ],
  ];

  function computePlatesForTargetWeight(targetWeight) {
    const availablePlates = [
      45,
      45,
      35,
      25,
      10,
      5,
      5,
      2.5,
      0.5,
      0.5,
      0.5,
      0.5,
    ];
    let currentWeight = barWeight;
    let platesUsed = [];
    for (const plate of availablePlates) {
      if (currentWeight + (plate * 2) <= targetWeight) {
        currentWeight += (plate * 2);
        platesUsed.push(plate);
      }
    }
    return platesUsed;
  }

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>{props.exerciseName}</th>
        </tr>
      </thead>
      <tbody>
        {weightRatiosByWeek[props.weekIndex].map(repsAndRatio => {
          const targetWeight = props.wendlerTrainingMax * repsAndRatio[1];
          const platesUsed = computePlatesForTargetWeight(targetWeight);
          const actualWeight = barWeight + platesUsed.reduce((a, b) => a + b, 0) * 2;
          return <tr>
            <td>
              {repsAndRatio[0] + " × " + actualWeight}
              {actualWeight === targetWeight ? null : <span style={{color: "#AAAAAA"}}>{" (" + targetWeight.toFixed(2) + ")"}</span>}
              {<br/>}
              {platesUsed.map(plate => {
                return <span>
                  <span className={"plate plate-" + plate.toString().replace(".", "-")}>{plate}</span>
                  &nbsp;
                </span>;
              })}
            </td>
          </tr>
        })}
      </tbody>
    </Table>
  );
}

function WeekTables(props) {
  return (
    <Row className="d-flex justify-content-center">
      <Col md="auto">
        <WeekTableColumn exerciseName="Press" wendlerTrainingMax={props.trainingMaxes.press} weekIndex={props.weekIndex}/>
      </Col>
      <Col md="auto">
        <WeekTableColumn exerciseName="Deadlift" wendlerTrainingMax={props.trainingMaxes.deadlift} weekIndex={props.weekIndex}/>
      </Col>
      <Col md="auto">
        <WeekTableColumn exerciseName="Bench" wendlerTrainingMax={props.trainingMaxes.bench} weekIndex={props.weekIndex}/>
      </Col>
      <Col md="auto">
        <WeekTableColumn exerciseName="Squat" wendlerTrainingMax={props.trainingMaxes.squat} weekIndex={props.weekIndex}/>
      </Col>
    </Row>
  );
}

function RoutineCalculator() {
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [trainingMaxes, setTrainingMaxes] = useState({
    press: 45,
    bench: 45,
    squat: 45,
    deadlift: 45
  })

  function computeWendlerTrainingMax(fiveRepMax) {
    const oneRepMax = fiveRepMax * (1 + 5 * 0.033333333);
    return Math.ceil((0.9 * oneRepMax) - 0.5);
  }

  function setTables(fiveRepMaxesDict) {
    // Compute training maxes
    let trainingMaxesDict = {}
    for (const key in fiveRepMaxesDict) {
      trainingMaxesDict[key] = computeWendlerTrainingMax(fiveRepMaxesDict[key]);
    }

    setTrainingMaxes(trainingMaxesDict);
    setIsTableVisible(true);

    // set URL params
    let searchParams = new URLSearchParams(fiveRepMaxesDict);
    window.history.replaceState({}, "", "?" + searchParams.toString());
  }

  useEffect(() => {
    // get URL params
    let fiveRepMaxesDict = Object.fromEntries(new URLSearchParams(window.location.search));
    if (fiveRepMaxesDict.hasOwnProperty('press') &&
        fiveRepMaxesDict.hasOwnProperty('bench') &&
        fiveRepMaxesDict.hasOwnProperty('squat') &&
        fiveRepMaxesDict.hasOwnProperty('deadlift')) {
      setTables(fiveRepMaxesDict);
    }
  // TODO: fixme
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid>
      <Container>
        <PRForm submitCallback={setTables}/>
      </Container>

      <hr/>
      {isTableVisible ?
        <Container fluid>
          {Array.from(Array(4), (e, i) => {
            return <div>
              <h4 className="d-flex justify-content-center">Week {i + 1}</h4>
              <br/>
              <WeekTables trainingMaxes={trainingMaxes} weekIndex={i}/>
              <hr/>
              <br/>
            </div>
          })}
        </Container>
      : null}
    </Container>
  );
}

function App() {
  return (
    <Container fluid>
      <Container>
        <Jumbotron>
          <h1 className="header">
            5/3/1 Calculator
          </h1>
        </Jumbotron>
      </Container>

      <RoutineCalculator/>

    </Container>
  );
}

export default App;

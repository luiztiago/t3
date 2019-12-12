import React from 'react';
import { Navbar, Container, Form, Button, Alert } from 'react-bootstrap';
import ReactLoading from "react-loading";
import DayPickerInput from 'react-day-picker/DayPickerInput';
import Trello from 'trello';
import BoardComponent from './components/BoardComponent.js';

import 'react-day-picker/lib/style.css';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    let apiKey = localStorage.getItem('trelloApiKey') || '';
    let token = localStorage.getItem('trelloToken') || '';

    this.state = {
      loading: false,
      apiKey: apiKey,
      token: token,
      trello: null,
      boards: [],
      boardId: "",
      boardIsSelected: false,
      errorMsg: "",
      date: new Date()
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleChangeBoard = this.handleChangeBoard.bind(this);
    this.handleTrelloCredentials = this.handleTrelloCredentials.bind(this);
  }

  handleTrelloCredentials(event) {
    localStorage.clear();

    this.setState({
      apiKey: '',
      token: '',
      trello: null,
      boards: [],
      boardId: "",
      boardIsSelected: false
    });
  }

  handleChangeBoard(event) {
    this.setState({
      boardId: event.target.value
    }, () => {
      this.setState({ boardIsSelected: true });
    });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleDateChange(day) {
    this.setState({
      loading: true,
      boardIsSelected: false,
      date: day
    }, () => {
      this.setState({ boardIsSelected: true, loading: false });
    });
  }

  handleConnect(event = null) {
    if (event) {
      event.preventDefault();
    }

    this.setState({loading: true});

    localStorage.setItem('trelloApiKey', this.state.apiKey);
    localStorage.setItem('trelloToken', this.state.token);

    let trello = new Trello(this.state.apiKey, this.state.token);
    this.setState({trello: trello}, () => {
      let boardsPromise = trello.getBoards('me');

      boardsPromise.then((resp) => {
        let newState = Array.isArray(resp) ? { loading: false, boards: resp, errorMsg: "" } : { loading: false, errorMsg: resp, trello: null };
        this.setState(newState);
      });
    });
  }

  render() {
    return (
      <div className="App">
        <Navbar bg="light" expand="lg">
          <Navbar.Brand className="mr-auto" href="#home">T3 - Trello Time Travel</Navbar.Brand>
          {this.state.trello && this.state.boards !== [] &&
            <Form inline onSubmit={() => {}}>
              <Form.Group controlId="exampleForm.ControlSelect1">
                <Button variant="link" type="button" size="sm" onClick={this.handleTrelloCredentials}>Change Trello Credentials</Button>
                <DayPickerInput name="date" value={this.state.date} onDayChange={this.handleDateChange} placeholder="mm/dd/yyyy" />
                <Form.Control as="select" value={this.state.boardId} name="boardId" onChange={this.handleChangeBoard} disabled={this.state.boardId}>
                  <option key="" value="-1">- Select Board -</option>,
                  {this.state.boards.map(board =>
                    <option key={board.id} value={board.id}>{board.name}</option>
                  )};
                </Form.Control>
              </Form.Group>
            </Form>
          }
        </Navbar>
        <div className="App-content">
          {this.state.boardIsSelected !== false ? (
            <BoardComponent trello={this.state.trello} id={this.state.boardId} date={this.state.date} changeBoard={this.handleChangeBoard} loading={this.state.loading} />
          ): (
            <Container className="pt-5">
              {this.state.loading ? <ReactLoading type="bars" /> : (
                (this.state.trello === null) &&
                  <Form onSubmit={this.handleConnect}>
                    {this.state.errorMsg && <Alert variant="danger">{this.state.errorMsg}</Alert>}
                    <Form.Group controlId="formBasicApiKey">
                      <Form.Label>API Key</Form.Label>
                      <Form.Control value={this.state.apiKey} type="text" name="apiKey" placeholder="Enter your API KEY" onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="formBasicToken">
                      <Form.Label>Token</Form.Label>
                      <Form.Control value={this.state.token} type="password" name="token" placeholder="Token" onChange={this.handleChange} />
                    </Form.Group>

                    <Button variant="primary" type="submit" size="lg" block disabled={!this.state.apiKey || !this.state.token}>
                      Get Boards
                    </Button>
                  </Form>
                )
              }
            </Container>
          ) }
        </div>
      </div>
    );
  }
}

export default App;

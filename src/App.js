import React from 'react';
import { Navbar, Container, Form, Button, Alert } from 'react-bootstrap';
import ReactLoading from "react-loading";
import Trello from 'trello';
import BoardComponent from './components/BoardComponent.js';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      apiKey: '',
      token: '',
      trello: null,
      boards: [],
      boardId: "",
      boardIsSelected: false,
      errorMsg: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleChangeBoard = this.handleChangeBoard.bind(this);
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

  handleConnect(event) {
    event.preventDefault();
    this.setState({loading: true});

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
                <Form.Control as="select" value={this.state.boardId} name="boardId" onChange={this.handleChangeBoard}>
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
            <BoardComponent trello={this.state.trello} id={this.state.boardId} changeBoard={this.handleChangeBoard} loading={this.state.loading} />
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
                      <Form.Control value={this.state.token} type="text" name="token" placeholder="Token" onChange={this.handleChange} />
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

import React from 'react';
import { Navbar, Container, Form, Button } from 'react-bootstrap';
import ReactLoading from "react-loading";
import Trello from 'trello';
import BoardComponent from './components/BoardComponent.js'
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
      boardId: null,
      boardIsSelected: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleSelectBoard = this.handleSelectBoard.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleConnect(event) {
    event.preventDefault();
    this.setState({loading: true});

    let trello = new Trello(this.state.apiKey, this.state.token);
    this.setState({trello: trello});

    let boardsPromise = trello.getBoards('me');

    boardsPromise.then((boards) => {
      this.setState({loading: false});
      this.setState({boards: boards});
    })
  }

  handleSelectBoard(event) {
    event.preventDefault();
    console.log(event);
    this.setState({boardIsSelected: true});
  }

  render() {
    return (
      <div className="App">
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">T3 - Trello Time Travel</Navbar.Brand>
        </Navbar>
        <div className="App-content">
          {this.state.boardIsSelected !== false ? (
            <BoardComponent trello={this.state.trello} id={this.state.boardId} />
          ): (
            <Container>
              {this.state.loading ? <ReactLoading type="bars" /> : (
                this.state.trello === null ? (
                  <Form onSubmit={this.handleConnect}>
                    <Form.Group controlId="formBasicApiKey">
                      <Form.Label>API Key</Form.Label>
                      <Form.Control value={this.state.apiKey} type="text" name="apiKey" placeholder="Enter your API KEY" onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="formBasicToken">
                      <Form.Label>Token</Form.Label>
                      <Form.Control value={this.state.token} type="text" name="token" placeholder="Token" onChange={this.handleChange} />
                    </Form.Group>

                    <Button variant="primary" type="submit" size="lg" block>
                      Get Boards
                    </Button>
                  </Form>
                ) : (
                  <div>
                    <Form onSubmit={this.handleSelectBoard}>
                      <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Select Board</Form.Label>
                        <Form.Control as="select" value={this.state.boardId} name="boardId" onChange={this.handleChange}>
                          <option value="-1">- Select -</option>,
                          {this.state.boards.map(board =>
                            <option key={board.id} value={board.id}>{board.name}</option>
                          )};
                        </Form.Control>
                        <Form.Text className="text-muted">
                          We'll never share your data with anyone else.
                        </Form.Text>
                      </Form.Group>
                      <Button variant="primary" type="submit" size="lg" block>
                        Submit
                      </Button>
                    </Form>
                  </div>
                )
              )}
            </Container>
          ) }
        </div>
      </div>
    );
  }
}

export default App;

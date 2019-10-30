import React from 'react';
import ReactLoading from "react-loading";
import Board from 'react-trello'

class BoardComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.id,
      trello: this.props.trello,
      lists: [],
      data: null,
    };

    this.handleBoardLists = this.handleBoardLists.bind(this);
    this.handleBoardCards = this.handleBoardCards.bind(this);

    let boardCardsPromise = this.state.trello.getCardsOnBoard(this.state.id);
    boardCardsPromise.then((boardCards) => {
      this.handleBoardCards(boardCards);
    })
  }

  handleBoardCards (cards) {
    console.log('cards');
    console.log(cards);

    let lists = []

    if (cards) {
      cards.map(card => {
        if (!lists[card['idList']]) {
          lists[card['idList']] = []
        }

        lists[card['idList']].push({
          id: card['id'],
          title: card['name']
        })
      })
    }

    this.setState({lists: lists});

    let boardListsPromise = this.state.trello.getListsOnBoard(this.state.id);
    boardListsPromise.then((boardLists) => {
      this.handleBoardLists(boardLists);

      console.log(boardLists);
    })
  }

  handleBoardLists (data) {
    data.shift();

    let lists = []

    if (data) {
      data.map(list => {
        lists.push({id: list['id'], title: list['name'], cards: this.state.lists[list['id']]})
      })
    }

    console.log(lists)
    this.setState({data: {lanes: lists}});
  }

  render() {
    return (
      <div>
        {this.state.data && (
          <Board data={this.state.data} cardStyle={{whiteSpace: 'normal'}} />
        )}
      </div>
    )
  }
}

export default BoardComponent;

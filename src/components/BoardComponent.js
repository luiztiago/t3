import React from 'react';
import Board from 'react-trello';

class BoardComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.id,
      trello: this.props.trello,
      lists: [],
      data: null,
      loading: this.props.loading
    };

    this.handleBoardLists = this.handleBoardLists.bind(this);
    this.handleBoardCards = this.handleBoardCards.bind(this);
    this.handleBoardLabels = this.handleBoardLabels.bind(this);

    this.loadBoardData();
  }

  loadBoardData () {
    let boardLabelsPromise = this.state.trello.getLabelsForBoard(this.state.id);
    boardLabelsPromise.then((boardLabels) => {
      this.handleBoardLabels(boardLabels);
    });
  }

  handleBoardLabels (data) {
    let boardCardsPromise = this.state.trello.getCardsOnBoardWithExtraParams(this.state.id, { members: true, member_fields: 'fullName,avatarUrl', tags: true});
    boardCardsPromise.then((boardCards) => {
      this.handleBoardCards(boardCards);
    });
  }

  handleBoardCards (cards) {
    let lists = [];

    if (cards) {
      cards.map(card => {
        if (!lists[card.idList]) {
          lists[card.idList] = [];
        }

        lists[card.idList].push({
          id: card.id,
          title: card.name,
          description: card.members.map(member => member.fullName).join(' - ')
        });
      });
    }

    this.setState({lists: lists});

    let boardListsPromise = this.state.trello.getListsOnBoard(this.state.id);
    boardListsPromise.then((boardLists) => {
      this.handleBoardLists(boardLists);
    });
  }

  handleBoardLists (data) {
    data.shift();

    let lists = [];

    if (data) {
      data.map(list => {
        lists.push({id: list.id, title: list.name, cards: this.state.lists[list.id]});
      });
    }

    this.setState(
      {data: { lanes: lists }},
      () => {
        this.setState({loading: false});
      }
    );
  }

  render() {
    return (
      <div>
        {this.state.data && (
          <Board data={this.state.data} cardStyle={{whiteSpace: 'normal'}} hideCardDeleteIcon={true} />
        )}
      </div>
    )
  }
}

export default BoardComponent;

import React from 'react';
import Board from 'react-trello';

class BoardComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.id,
      trello: this.props.trello,
      currentBoard: this.props.currentBoard,
      lists: [],
      cards: [],
      cardsData: null,
      loading: this.props.loading,
      date: this.props.date
    };

    this.loadBoardData();
  }

  loadBoardData () {
    let boardCardsPromise = this.state.trello.getCardsOnBoardWithExtraParams(this.state.id, { members: true, member_fields: 'fullName,avatarUrl', tags: true});
    boardCardsPromise.then((boardCards) => {
      this.setState({cardsData: boardCards});
      this.handleBoardCards();
    });
  }

  handleBoardCards () {
    let lists = [];

    if (this.state.cardsData) {
      this.state.cardsData.map((card) => {
        this.state.cards[card.id] = {
          id: card.id,
          title: card.name,
          description: card.members.map(member => member.fullName).join(' - ')
        };

        return;
      });
    }

    this.setState({lists: lists});

    this.loadBoardActions();
  }

  loadBoardActions () {
    let dateAtEndOfDay = new Date(this.state.date.setHours(23,59,59,999));
    let boardActionsPromise = this.state.trello.getActionsOnBoardWithExtraParams(this.state.id, {filter: 'createCard,copyCard,updateCard:idList', before: dateAtEndOfDay, limit: '200'});
    boardActionsPromise.then((boardActions) => {
      this.handleBoardActions(boardActions);
    });
  }

  handleBoardActions (boardActions) {
    let cardIds = [];

    let actions = boardActions.filter(action => {
      let isTheLastActionForCard = false;
      action.date = new Date(action.date);

      if (!cardIds.includes(action.data.card.id)) {
        isTheLastActionForCard = true;
        cardIds.push(action.data.card.id);
      }

      return (isTheLastActionForCard == true);
    });

    actions.map(action => {
      let card = action.data.card;
      if (!this.state.lists[card.idList]) {
        this.state.lists[card.idList] = [];
      }

      this.state.lists[card.idList].push(this.state.cards[card.id]);
    });

    this.loadBoardLists();
  }

  loadBoardLists () {
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
          <Board data={this.state.data} cardStyle={{whiteSpace: 'normal'}} hideCardDeleteIcon={true} style={{backgroundColor: '#282c34', backgroundSize: 'cover', backgroundImage: 'url("' + this.state.currentBoard.background + '")'}} />
        )}
      </div>
    )
  }
}

export default BoardComponent;

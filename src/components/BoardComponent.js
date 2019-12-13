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
      customFields: [],
      cardsData: null,
      loading: this.props.loading,
      date: this.props.date
    };

    this.loadBoardCustomFields();
  }

  loadBoardCustomFields () {
    let boardCustomFieldsPromise = this.state.trello.getCustomFieldsOnBoard(this.state.id);
    boardCustomFieldsPromise.then((customFields) => {
      this.handleBoardCustomFields(customFields);
    });
  }

  handleBoardCustomFields (data) {
    let customFields = data.filter(customField => {
      return (customField.options);
    });

    let options = [];
    if (customFields.length) {
      customFields[0].options.map((option) => {
        options[option.id] = { id: option.id, customFieldId: option.idCustomField, name: option.value.text, color: option.color };
      });

      this.setState({customFields: options});
    }

    this.loadBoardData();
  }

  loadBoardData () {
    let boardCardsPromise = this.state.trello.getCardsOnBoardWithExtraParams(this.state.id, { members: true, member_fields: 'fullName,avatarUrl', tags: true, customFieldItems: true});
    boardCardsPromise.then((boardCards) => {
      this.setState({cardsData: boardCards});
      this.handleBoardCards();
    });
  }

  handleBoardCards () {
    let cards = [];

    if (this.state.cardsData) {
      this.state.cardsData.map((card) => {
        let tags = [];
        if (card.customFieldItems) {
          card.customFieldItems.map((customFieldItem) => {
            let customField = this.state.customFields[customFieldItem.idValue];
            if (customField) {
              tags.push({title: customField.name, color: 'white', bgcolor: customField.color});
            }
          });
        }

        cards[card.id] = {
          id: card.id,
          title: card.name,
          description: card.members.map(member => member.fullName).join(' - '),
          tags: tags
        };

        return;
      });
    }

    this.setState({cards: cards});

    this.loadBoardActions();
  }

  loadBoardActions () {
    let dateAtEndOfDay = new Date(this.state.date.setHours(23,59,59,999));
    let boardActionsPromise = this.state.trello.getActionsOnBoardWithExtraParams(this.state.id, {filter: 'createCard,copyCard,updateCard:idList', before: dateAtEndOfDay, limit: '500'});
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

      if (this.state.cards[card.id]){
        this.state.lists[card.idList].push(this.state.cards[card.id]);
      }
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

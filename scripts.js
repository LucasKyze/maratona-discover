const Modal = {
  toggle() {
    document.querySelector('.modal-overlay').classList.toggle('active');
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
  }
}

const Transaction = {
  all: Storage.get(),
  
  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;

    Transaction.all.forEach(t => {t.amount > 0 ? income += t.amount : 0});
    return income;
  },
  expanses() {
    let expanse = 0;

    Transaction.all.forEach(t => {t.amount < 0 ? expanse += t.amount : 0});
    return expanse;
  },
  total() {
    return Transaction.incomes() + Transaction.expanses();
  }
}

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),
  
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHtMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionContainer.appendChild(tr);
  },

  innerHtMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expanse";
    
    const amount = Utils.formatCurrency(transaction.amount);

    const html = 
    `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Imagem de Remover Transação"></td>
    `
    return html;
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expanses());
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
  },

  clearTransations() {
    DOM.transactionContainer.innerHTML = "";
  }

}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replaceAll(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    return signal + value;
  },
  
  formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },

  formatDate(date) {
    const split = date.split("-");
    return split[2] + "/" + split[1] + "/" + split[0];
  }
}

const Form = {
  description : document.querySelector('input#description'),
  amount : document.querySelector('input#amount'),
  date : document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error('Por favor, preencha todos os campos.');
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return { description, amount, date };
  },
  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();

      const transaction = Form.formatValues();

      Form.saveTransaction(transaction);
      Form.clearFields();
      Modal.toggle();
    } catch(err) {
      alert(err.message);
    }

/*     Form.formatData();
    Form.saveData(); */
  }
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransations();
    App.init();
  }
}

App.init();
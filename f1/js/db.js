import { openDB } from "idb";

let db;

async function criarDB() {
    try {
        db = await openDB('formula1', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                if (oldVersion === 0) {
                    const store = db.createObjectStore('pistaF1', {
                        keyPath: 'nomePista'
                    });
                    store.createIndex('id', 'nomePista');
                    console.log("Banco de dados criado!");
                }
            }
        });
        console.log("Banco de dados aberto!");
    } catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event => {
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarPistaFormula1);
    document.getElementById('btnCarregar').addEventListener('click', listarPistasFormula1);
});

async function adicionarPistaFormula1() {
    let nomePista = document.getElementById("nomePista").value;
    let pais = document.getElementById("pais").value;
    let quantidadeCurvas = document.getElementById("quantidadeCurvas").value;
    let dataGrandePremio = document.getElementById("dataGrandePremio").value;
    let estiloPista = document.getElementById("estiloPista").value;
    let licencaFIA = document.getElementById("licencaFIA").value;

    if (!nomePista || !pais || !quantidadeCurvas || !dataGrandePremio || !estiloPista || !licencaFIA) {
        console.log('Preencha todos os campos obrigatórios.');
        return;
    }

    const tx = await db.transaction('pistaF1', 'readwrite');
    const store = tx.objectStore('pistaF1');

    try {
        await store.add({
            nomePista: nomePista,
            pais: pais,
            quantidadeCurvas: quantidadeCurvas,
            dataGrandePremio: dataGrandePremio,
            estiloPista: estiloPista,
            licencaFIA: licencaFIA
        });
        await tx.done;
        limparCampos();
        console.log('Pista de Fórmula 1 cadastrada com sucesso!');
    } catch (error) {
        console.error('Erro ao cadastrar pista de Fórmula 1:', error);
        tx.abort();
    }
}

async function listarPistasFormula1() {
    if (db === undefined) {
        console.log("O banco de dados está fechado.");
    }

    const tx = await db.transaction('pistaF1', 'readonly');
    const store = await tx.objectStore('pistaF1');
    const pistasFormula1 = await store.getAll();

    if (pistasFormula1) {
        const divLista = pistasFormula1.map(pista => {
            return `<div class="item">
                    <p>Nome da Pista: ${pista.nomePista}</p>
                    <p>País: ${pista.pais}</p>
                    <p>Quantidade de Curvas: ${pista.quantidadeCurvas}</p>
                    <p>Data do Grande Prêmio: ${pista.dataGrandePremio}</p>
                    <p>Grau de Licença FIA: ${pista.licencaFIA}</p>
                </div>`;
        });
        listagem(divLista.join(' '));
    }
}

function limparCampos() {
    document.getElementById("nomePista").value = '';
    document.getElementById("pais").value = '';
    document.getElementById("quantidadeCurvas").value = '';
    document.getElementById("dataGrandePremio").value = '';
    document.getElementById("estiloPista").value = '';
    document.getElementById("licencaFIA").value = '';
}

function listagem(text) {
    document.getElementById('resultados').innerHTML = text;
}
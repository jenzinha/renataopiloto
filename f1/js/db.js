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
    document.getElementById('btnBuscar').addEventListener('click', buscarPistaFormula1);
});

async function adicionarPistaFormula1() {
    let nomePista = document.getElementById("nomePista").value;
    let pais = document.getElementById("pais").value;
    let quantidadeCurvas = document.getElementById("quantidadeCurvas").value;
    let dataGrandePremio = document.getElementById("dataGrandePremio").value;
    let estiloPista = document.getElementById("estiloPista").value;
    let licencaFIA = document.getElementById("licencaFIA").value;
    let latitude = document.getElementById("latitude").value;
    let longitude = document.getElementById("longitude").value;

    if (!nomePista || !pais || !quantidadeCurvas || !dataGrandePremio || !estiloPista || !licencaFIA) {
        console.log('Preencha todos os campos obrigatórios.');
        return;
    }
    if (!latitude || !longitude) {
        console.log('Preencha os campos de latitude e longitude.');
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
            licencaFIA: licencaFIA,
            latitude: latitude, 
            longitude: longitude 
        });
        await tx.done;
        limparCampos();
        exibirNoMapa(parseFloat(latitude), parseFloat(longitude));
        console.log('Pista cadastrada com sucesso!');
    } catch (error) {
        console.error('Erro ao cadastrar pista:', error);
        tx.abort();
    }
}
function exibirNoMapa(latitude, longitude) {
    if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Coordenadas inválidas.');
        return;
    }

    const mapTitle = document.getElementById('mapTitulo');
    mapTitle.style.display = 'block'; 

    const myLatlng = new google.maps.LatLng(latitude, longitude);
    const mapOptions = {
        zoom: 10,
        center: myLatlng,
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    const marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: 'Local da Pista',
    });

    document.getElementById('map').style.display = 'block';
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
            return `<center> <div class="item">
                    <p>Nome da Pista: ${pista.nomePista}</p>
                    <p>País: ${pista.pais}</p>
                    <p>Quantidade de Curvas: ${pista.quantidadeCurvas}</p>
                    <p>Data do Grande Prêmio: ${pista.dataGrandePremio}</p>
                    <p>Grau de Licença FIA: ${pista.licencaFIA}</p>
                    <button class="btnMostrarMapa" data-latitude="${pista.latitude}" data-longitude="${pista.longitude}">Mostrar Mapa</button>
                    </div> </center>`;
        });
        listagem(divLista.join(' '));
        document.querySelectorAll('.btnMostrarMapa').forEach(button => {
            button.addEventListener('click', function () {
              const latitude = parseFloat(this.getAttribute('data-latitude'));
              const longitude = parseFloat(this.getAttribute('data-longitude'));
              exibirNoMapa(latitude, longitude);
            });
        });
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

async function buscarPistaFormula1() {
    const nomePistaBusca = document.getElementById('inputBuscar').value;
    if (!nomePistaBusca) {
        console.log('Nome da pista não fornecido para busca.');
        return;
    }

    const tx = await db.transaction('pistaF1', 'readonly');
    const store = tx.objectStore('pistaF1');
    const index = store.index('id');

    try {
        const pistaEncontrada = await index.get(nomePistaBusca);
        if (pistaEncontrada) {
            const divPista = ` <center> <div class="item">
                <p>Nome da Pista: ${pistaEncontrada.nomePista}</p>
                <p>País: ${pistaEncontrada.pais}</p>
                <p>Quantidade de Curvas: ${pistaEncontrada.quantidadeCurvas}</p>
                <p>Data do Grande Prêmio: ${pistaEncontrada.dataGrandePremio}</p>
                <p>Grau de Licença FIA: ${pistaEncontrada.licencaFIA}</p>
            </div> </center>`;
            listagem(divPista);
        } else {
            console.log(`Pista com o nome '${nomePistaBusca}' não encontrada.`);
            listagem(''); 
        }
    } catch (error) {
        console.error('Erro ao buscar pista de Fórmula 1:', error);
    }
}

async function deletarPistaFormula1() {
    const nomePistaDeletar = document.getElementById('inputBuscar').value;
    if (!nomePistaDeletar) {
        console.log('Nome da pista não fornecido para exclusão.');
        return;
    }

    const tx = await db.transaction('pistaF1', 'readwrite');
    const store = tx.objectStore('pistaF1');

    try {
        const pistaDeletar = await store.get(nomePistaDeletar);
        if (pistaDeletar) {
            await store.delete(nomePistaDeletar);
            await tx.done;
            console.log(`Pista '${nomePistaDeletar}' deletada com sucesso.`);
            listarPistasFormula1(); 
        } else {
            console.log(`Pista com o nome '${nomePistaDeletar}' não encontrada para exclusão.`);
        }
    } catch (error) {
        console.error('Erro ao deletar pista de Fórmula 1:', error);
        tx.abort();
    }
}


document.getElementById('btnDeletar').addEventListener('click', deletarPistaFormula1);

function listagem(text) {
    document.getElementById('resultados').innerHTML = text;
}

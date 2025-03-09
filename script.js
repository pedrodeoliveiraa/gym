let currentTabContent = null;

document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('workoutData');
    if (savedData) {
        const data = JSON.parse(savedData);
        data.forEach(tab => createTab(tab.name, tab.exercises));
        if (data.length > 0) showTabContent(document.querySelector('.tab'));
    }
});

// NOTIFICAÇÕES
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.opacity = '1';
        }, 300);
    }, 3000);
}

// MODAIS
function openNewTabModal() {
    document.getElementById('newTabModal').style.display = 'block';
}

function closeNewTabModal() {
    document.getElementById('newTabModal').style.display = 'none';
    document.getElementById('newTabName').value = '';
}

// CRIAR ABA
function handleCreateTab() {
    const tabName = document.getElementById('newTabName').value.trim();
    if (!tabName) {
        showNotification('Digite um nome para a aba!', 'error');
        return;
    }
    
    createTab(tabName);
    closeNewTabModal();
    showNotification('Aba criada com sucesso!');
}

function createTab(name, exercises = []) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.innerHTML = `
        <i class="fas fa-dumbbell"></i> ${name}
        <i class="fas fa-times close-tab" onclick="confirmDeleteTab(this)"></i>
    `;
    tab.addEventListener('click', () => showTabContent(tab));
    
    document.getElementById('tabBar').insertBefore(tab, document.querySelector('.new-tab-btn'));
    
    const content = document.createElement('div');
    content.className = 'tab-content';
    content.innerHTML = `
        <div class="form-container">
            <h4>Novo Treino</h4>
            <div class="input-group">
                <label>Nome do Treino</label>
                <input type="text" id="exerciseName_${name}" placeholder="Ex: Supino Reto">
            </div>
            <div class="input-group">
                <label>Peso (kg)</label>
                <input type="number" id="weight_${name}" placeholder="Ex: 80">
            </div>
            <div class="input-group">
                <label>Séries</label>
                <input type="number" id="sets_${name}" placeholder="Ex: 4">
            </div>
            <div class="input-group">
                <label>Repetições</label>
                <input type="number" id="repetitions_${name}" placeholder="Ex: 12">
            </div>
            <button class="btn btn-primary" onclick="saveExercise('${name}')">Salvar</button>
        </div>
        <div class="exercises-container"></div>
    `;
    content.style.display = 'none';
    document.getElementById('tabContent').appendChild(content);
    
    if (exercises.length > 0) {
        exercises.forEach(ex => addExercise(ex.name, ex.weight, ex.sets, ex.reps, content.querySelector('.exercises-container')));
    }
    
    return tab;
}

// EXIBIR CONTEÚDO DA ABA
function showTabContent(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    
    tab.classList.add('active');
    const contentIndex = [...tab.parentElement.children].indexOf(tab);
    const content = document.querySelectorAll('.tab-content')[contentIndex];
    
    content.style.display = 'block';
    currentTabContent = content;
}

// ADICIONAR TREINO
function saveExercise(tabName) {
    const name = document.getElementById(`exerciseName_${tabName}`).value.trim();
    const weight = document.getElementById(`weight_${tabName}`).value.trim();
    const sets = document.getElementById(`sets_${tabName}`).value.trim();
    const reps = document.getElementById(`repetitions_${tabName}`).value.trim();
    
    if (!name || !weight || !sets || !reps) {
        showNotification('Preencha todos os campos!', 'error');
        return;
    }

    if (isNaN(weight) || isNaN(sets) || isNaN(reps)) {
        showNotification('Peso, séries e repetições devem ser números!', 'error');
        return;
    }

    const exerciseContainer = currentTabContent.querySelector('.exercises-container');
    const exerciseElement = createExerciseCard(name, weight, sets, reps);
    exerciseContainer.appendChild(exerciseElement);
    
    // Limpar formulário
    document.getElementById(`exerciseName_${tabName}`).value = '';
    document.getElementById(`weight_${tabName}`).value = '';
    document.getElementById(`sets_${tabName}`).value = '';
    document.getElementById(`repetitions_${tabName}`).value = '';
    
    showNotification('Treino adicionado!');
    saveData();
}

function createExerciseCard(name, weight, sets, reps) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML = `
        <div class="exercise-info">
            <strong>${name}</strong>
            <div class="exercise-details">
                <p>Peso: ${weight}kg</p>
                <p>Séries: ${sets}</p>
                <p>Repetições: ${reps}</p>
            </div>
        </div>
        <div class="actions">
            <button class="minimize-btn" onclick="toggleDetails(this)">▼</button>
            <button class="btn btn-danger" onclick="deleteExercise(this)">Excluir</button>
        </div>
    `;
    return card;
}

// MINIMIZAR/EXPANDIR DETALHES
function toggleDetails(button) {
    const card = button.closest('.exercise-card');
    const details = card.querySelector('.exercise-details');
    
    // Alterna a visibilidade dos detalhes
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.textContent = '▼';  // Mostrar todos os detalhes
    } else {
        details.style.display = 'none';
        button.textContent = '▲';  // Minimizar os detalhes
    }
}

// EXCLUIR TREINO
function deleteExercise(button) {
    const card = button.closest('.exercise-card');
    card.remove();  // Remove o treino da interface

    showNotification('Treino excluído!', 'success');  // Exibe a notificação
    saveData();  // Atualiza os dados no localStorage
}

// EXCLUIR ABA
function confirmDeleteTab(element) {
    const tab = element.closest('.tab');
    const contentIndex = [...tab.parentElement.children].indexOf(tab);
    const content = document.querySelectorAll('.tab-content')[contentIndex];
    
    tab.remove();  // Remove a aba
    content.remove();  // Remove o conteúdo da aba
    
    // Se não houver mais abas, exibe o estado vazio
    if (document.querySelectorAll('.tab').length === 0) {
        document.getElementById('tabContent').innerHTML = '<div class="empty-state">Nenhuma aba criada ainda.</div>';
    }
    
    showNotification('Aba excluída!');  // Exibe a notificação
    saveData();  // Atualiza os dados no localStorage
}

// PERSISTÊNCIA DE DADOS
function saveData() {
    const tabs = [];
    document.querySelectorAll('.tab').forEach(tab => {
        const content = document.querySelectorAll('.tab-content')[[...tab.parentElement.children].indexOf(tab)];
        const exercises = Array.from(content.querySelectorAll('.exercise-card')).map(ex => {
            const name = ex.querySelector('strong').textContent;
            const weight = ex.querySelector('.exercise-details p:first-child').textContent.split(':')[1].trim().replace('kg','');
            const sets = ex.querySelector('.exercise-details p:nth-child(2)').textContent.split(':')[1].trim();
            const reps = ex.querySelector('.exercise-details p:last-child').textContent.split(':')[1].trim();
            return { name, weight, sets, reps };
        });
        
        tabs.push({
            name: tab.textContent.trim().replace('×', ''),
            exercises: exercises
        });
    });
    
    localStorage.setItem('workoutData', JSON.stringify(tabs));
}

function createTab(name, exercises = []) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.innerHTML = `
        <i class="fas fa-dumbbell"></i> ${name}
        <i class="fas fa-times close-tab" onclick="confirmDeleteTab(this)"></i>
    `;
    tab.addEventListener('click', () => showTabContent(tab));

    document.getElementById('tabBar').insertBefore(tab, document.querySelector('.new-tab-btn'));

    const content = document.createElement('div');
    content.className = 'tab-content';
    content.innerHTML = `
        <div class="form-container">
            <div class="form-header">
                <h4>Novo Treino</h4>
                <button class="btn btn-secondary minimize-form-btn" onclick="toggleNewWorkoutForm(this)">▲</button>
            </div>
            <div class="form-body">
                <div class="input-group">
                    <label>Nome do Treino</label>
                    <input type="text" id="exerciseName_${name}" placeholder="Ex: Supino Reto">
                </div>
                <div class="input-group">
                    <label>Peso (kg)</label>
                    <input type="number" id="weight_${name}" placeholder="Ex: 80">
                </div>
                <div class="input-group">
                    <label>Séries</label>
                    <input type="number" id="sets_${name}" placeholder="Ex: 4">
                </div>
                <div class="input-group">
                    <label>Repetições</label>
                    <input type="number" id="repetitions_${name}" placeholder="Ex: 12">
                </div>
                <button class="btn btn-primary" onclick="saveExercise('${name}')">Salvar</button>
            </div>
        </div>
        <div class="exercises-container"></div>
    `;
    content.style.display = 'none';
    document.getElementById('tabContent').appendChild(content);

    if (exercises.length > 0) {
        exercises.forEach(ex => addExercise(ex.name, ex.weight, ex.sets, ex.reps, content.querySelector('.exercises-container')));
    }

    return tab;
}

function toggleNewWorkoutForm(button) {
    const formBody = button.closest('.form-container').querySelector('.form-body');
    
    if (formBody.style.display === 'none') {
        formBody.style.display = 'block';
        button.textContent = '▲'; // Ícone para expandir
    } else {
        formBody.style.display = 'none';
        button.textContent = '▼'; // Ícone para minimizar
    }
}

document.addEventListener('DOMContentLoaded', () => {
 
    const API_URL = 'http://localhost:3000';


    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }


    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        const newProfileForm = document.getElementById('new-profile-form');

        if (newProfileForm) { 
            newProfileForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = new FormData();

                formData.append('name', document.getElementById('name').value.trim());
                formData.append('email', document.getElementById('email').value.trim());
                formData.append('password', document.getElementById('password').value.trim());
                formData.append('idade', document.getElementById('age').value);
                formData.append('rua', document.getElementById('street').value.trim());
                formData.append('bairro', document.getElementById('neighborhood').value.trim());
                formData.append('estado', document.getElementById('state').value.trim());
                formData.append('biografia', document.getElementById('biografia').value.trim());

                const imagemPerfilInput = document.getElementById('imagem_perfil');
                if (imagemPerfilInput && imagemPerfilInput.files.length > 0) {
                    formData.append('imagem_perfil', imagemPerfilInput.files[0]);
                }

                if (!formData.get('name') || !formData.get('email') || !formData.get('password') || !formData.get('idade') || !formData.get('rua') || !formData.get('bairro') || !formData.get('estado')) {
                    alert('Por favor, preencha todos os campos obrigatórios (Nome, Email, Senha, Idade, Rua, Bairro, Estado).');
                    return;
                }
                if (isNaN(parseInt(formData.get('idade'))) || parseInt(formData.get('idade')) < 1) {
                    alert('Por favor, insira uma idade válida.');
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/users`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ msg: 'Erro desconhecido.' }));
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg}`);
                    }

                    alert('Perfil cadastrado com sucesso!');
                    window.location.href = 'list.html';
                } catch (error) {
                    console.error('Erro ao cadastrar perfil:', error);
                    alert(`Erro ao cadastrar perfil: ${error.message}`);
                }
            });
        }
    }


    if (window.location.pathname.endsWith('list.html')) {
        const profilesContainer = document.getElementById('profiles-container');
        const loadingMessage = document.getElementById('loading-message');
        const noProfilesMessage = document.getElementById('no-profiles-message');
        const addNewProfileButton = document.getElementById('add-new-profile-button');

        if (addNewProfileButton) {
            addNewProfileButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        async function loadProfiles() {
            if (profilesContainer) profilesContainer.innerHTML = '';
            if (loadingMessage) loadingMessage.classList.remove('hidden');
            if (noProfilesMessage) noProfilesMessage.classList.add('hidden');

            try {
                const response = await fetch(`${API_URL}/users`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const profiles = await response.json();

                if (loadingMessage) loadingMessage.classList.add('hidden');

                if (profiles.length === 0) {
                    if (noProfilesMessage) noProfilesMessage.classList.remove('hidden');
                } else {
                    if (profilesContainer) {
                        profiles.forEach(profile => {
                            const imageUrl = profile.imagem_perfil ? `${API_URL}/${profile.imagem_perfil}` : 'https://via.placeholder.com/150/007bff/ffffff?text=Perfil';

                            const profileCard = document.createElement('div');
                            profileCard.classList.add('profile-card');
                            profileCard.innerHTML = `
                                <div class="profile-card-avatar">
                                    <img src="${imageUrl}" alt="Foto de ${profile.name}">
                                </div>
                                <h3>${profile.name}</h3>
                                <p>${profile.idade ? profile.idade + ' anos' : 'Idade não informada'}</p>
                                <p>${profile.email || 'Email não informado'}</p>
                            `;
                            profileCard.addEventListener('click', () => {
                                window.location.href = `profile.html?email=${profile.email}`;
                            });
                            profilesContainer.appendChild(profileCard);
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar lista de perfis:', error);
                if (loadingMessage) loadingMessage.textContent = 'Erro ao carregar perfis.';
                alert('Não foi possível carregar a lista de perfis. Verifique o backend e o CORS.');
            }
        }

        loadProfiles();
    }

    if (window.location.pathname.endsWith('profile.html')) {
        console.log('Estou na página profile.html!');

        const userEmail = getUrlParameter('email');
        if (!userEmail) {
            alert('Email do perfil não encontrado na URL.');
            window.location.href = 'list.html';
            return;
        }


        const profileImage = document.getElementById('profile-image');
        const profileNameHeader = document.getElementById('profile-name');
        const displayName = document.getElementById('display-name');
        const displayEmail = document.getElementById('display-email');
        const displayAge = document.getElementById('display-age');
        const displayAddress = document.getElementById('display-address');
        const displayBiografia = document.getElementById('display-biografia');
        const editButton = document.getElementById('edit-button');
        const deleteButton = document.getElementById('delete-button');

        const displayProfileSection = document.getElementById('display-profile-section');
        const editProfileSection = document.getElementById('edit-profile-section');
        const profileForm = document.getElementById('profile-form'); // O formulário de edição

        // Campos do formulário de edição
        const nameEdit = document.getElementById('name-edit');

        const passwordEdit = document.getElementById('password-edit');
        const ageEdit = document.getElementById('age-edit');
        const streetEdit = document.getElementById('street-edit');
        const neighborhoodEdit = document.getElementById('neighborhood-edit');
        const stateEdit = document.getElementById('state-edit');
        const biografiaEdit = document.getElementById('biografia-edit');
        
        // Campo de upload de arquivo para imagem de perfil
        const imagemPerfilEditFile = document.getElementById('imagem_perfil-edit-file');
        const imagemPerfilPreview = document.getElementById('imagem_perfil-preview');
        
        const cancelButton = document.getElementById('cancel-button');

        let currentProfileData = {}; 

        // Adiciona listener para pré-visualização da imagem
        if (imagemPerfilEditFile && imagemPerfilPreview) {
            imagemPerfilEditFile.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagemPerfilPreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    
                    if (currentProfileData.imagem_perfil) {
                        imagemPerfilPreview.src = `${API_URL}/${currentProfileData.imagem_perfil}`;
                    } else {
                        imagemPerfilPreview.src = 'https://via.placeholder.com/100x100?text=Sem+Foto';
                    }
                }
            });
        }

        // Função para carregar os dados de um perfil específico
        async function loadProfileDetails() {
            try {
                const response = await fetch(`${API_URL}/users`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const allUsers = await response.json();
                const data = allUsers.find(user => user.email === userEmail);

                if (!data) {
                    alert('Perfil não encontrado.');
                    window.location.href = 'list.html';
                    return;
                }

                currentProfileData = data; 
                updateProfileDetailsUI(data);
            } catch (error) {
                console.error('Erro ao carregar detalhes do perfil:', error);
                alert('Não foi possível carregar os detalhes do perfil. Verifique o backend.');
                window.location.href = 'list.html';
            }
        }

        // Função para atualizar a interface com os dados do perfil
        function updateProfileDetailsUI(data) {
            const imageUrl = data.imagem_perfil ? `${API_URL}/${data.imagem_perfil}` : 'https://via.placeholder.com/150/007bff/ffffff?text=Perfil';
            if (profileImage) profileImage.src = imageUrl;
            if (profileNameHeader) profileNameHeader.textContent = data.name || 'Nome do Usuário';
            if (displayName) displayName.textContent = data.name || 'Não informado';
            if (displayEmail) displayEmail.textContent = data.email || 'Não informado';
            if (displayAge) displayAge.textContent = data.idade ? `${data.idade} anos` : 'Não informado';
            if (displayAddress) displayAddress.textContent = `${data.rua || 'Não informada'}, ${data.bairro || 'Não informado'}, ${data.estado || 'Não informado'}`;
            if (displayBiografia) displayBiografia.textContent = data.biografia || 'Nenhuma biografia disponível.';

            // Preencher o formulário para edição ao carregá-lo
            if (nameEdit) nameEdit.value = data.name || '';
            if (ageEdit) ageEdit.value = data.idade || '';
            if (streetEdit) streetEdit.value = data.rua || '';
            if (neighborhoodEdit) neighborhoodEdit.value = data.bairro || '';
            if (stateEdit) stateEdit.value = data.estado || '';
            if (biografiaEdit) biografiaEdit.value = data.biografia || '';
            
            // Limpa o campo de senha por segurança
            if (passwordEdit) passwordEdit.value = '';

            // Define a pré-visualização da imagem atual
            if (imagemPerfilPreview) {
                const currentPreviewUrl = data.imagem_perfil ? `${API_URL}/${data.imagem_perfil}` : 'https://via.placeholder.com/100x100?text=Sem+Foto';
                imagemPerfilPreview.src = currentPreviewUrl;
            }
            // Limpa o input de arquivo para que o usuário possa selecionar um novo
            if (imagemPerfilEditFile) imagemPerfilEditFile.value = ''; 
        }

        // Função para salvar as alterações do perfil
        async function saveProfileChanges(event) {
            event.preventDefault(); 

            const formData = new FormData(); 

            formData.append('name', nameEdit.value.trim());
            formData.append('idade', parseInt(ageEdit.value)); 
            formData.append('rua', streetEdit.value.trim());
            formData.append('bairro', neighborhoodEdit.value.trim());
            formData.append('estado', stateEdit.value.trim());
            formData.append('biografia', biografiaEdit.value.trim());

         
            if (passwordEdit.value.trim() !== '') {
                formData.append('password', passwordEdit.value.trim());
            }

            
            if (imagemPerfilEditFile && imagemPerfilEditFile.files.length > 0) {
                formData.append('imagem_perfil', imagemPerfilEditFile.files[0]);
            }
            

            if (!formData.get('name') || isNaN(parseInt(formData.get('idade'))) || parseInt(formData.get('idade')) < 1 || !formData.get('rua') || !formData.get('bairro') || !formData.get('estado')) {
                alert('Por favor, preencha todos os campos obrigatórios (Nome, Idade, Rua, Bairro, Estado) e garanta que a idade é um número válido.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/${currentProfileData.email}`, {
                    method: 'PUT',
                    body: formData 
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ msg: 'Erro desconhecido.' }));
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg}`);
                }

                alert('Perfil atualizado com sucesso!');
                
                await loadProfileDetails(); 
                
                if (displayProfileSection) displayProfileSection.classList.remove('hidden');
                if (editProfileSection) editProfileSection.classList.add('hidden');

            } catch (error) {
                console.error('Erro ao salvar alterações do perfil:', error);
                alert(`Erro ao salvar perfil: ${error.message}`);
            }
        }

        // Função para excluir o perfil
        async function deleteProfile() {
            console.log('Tentando excluir perfil...');
            if (!confirm('Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.')) {
                console.log('Exclusão cancelada pelo usuário.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/users/${currentProfileData.email}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ msg: 'Erro desconhecido.' }));
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg}`);
                }

                alert('Perfil excluído com sucesso!');
                window.location.href = 'list.html';
            } catch (error) {
                console.error('Erro ao excluir perfil:', error);
                alert(`Erro ao excluir perfil: ${error.message}`);
            }
        }

      
        if (editButton) {
            editButton.addEventListener('click', () => {
                console.log('Botão Editar Perfil clicado!');
                if (displayProfileSection) displayProfileSection.classList.add('hidden');
                if (editProfileSection) editProfileSection.classList.remove('hidden');
                

                if (nameEdit) nameEdit.value = currentProfileData.name || '';
                if (passwordEdit) passwordEdit.value = ''; 
                if (ageEdit) ageEdit.value = currentProfileData.idade || '';
                if (streetEdit) streetEdit.value = currentProfileData.rua || '';
                if (neighborhoodEdit) neighborhoodEdit.value = currentProfileData.bairro || '';
                if (stateEdit) stateEdit.value = currentProfileData.estado || '';
                if (biografiaEdit) biografiaEdit.value = currentProfileData.biografia || '';
                
                // Redefine o input de arquivo e a pré-visualização ao abrir a edição
                if (imagemPerfilEditFile) imagemPerfilEditFile.value = ''; 
                const currentPreviewUrl = currentProfileData.imagem_perfil ? `${API_URL}/${currentProfileData.imagem_perfil}` : 'https://via.placeholder.com/100x100?text=Sem+Foto';
                if (imagemPerfilPreview) imagemPerfilPreview.src = currentPreviewUrl; 
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener('click', deleteProfile);
        }

        // Listener para o formulário de edição 
        if (profileForm) {
            profileForm.addEventListener('submit', saveProfileChanges);
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                console.log('Botão Cancelar clicado!');
                if (displayProfileSection) displayProfileSection.classList.remove('hidden');
                if (editProfileSection) editProfileSection.classList.add('hidden');
                loadProfileDetails(); // Recarrega para garantir que os dados exibidos estão atualizados
            });
        }

        loadProfileDetails();
    }
});
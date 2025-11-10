(function(){
        const userName = 'pedrof'; // Login do usuário fixo
        let nextCompanyCode = 3; // Próximo código empresa
        let nextSegmentCode = 1; // Próximo código segmento

        // Referencias DOM
        const btnAddCompany = document.getElementById('btn-add-company');
        const addCompanyContainer = document.getElementById('add-company-container');
        const tableBody = document.getElementById('table-body');

        const btnAddSegment = document.getElementById('btn-add-segment');
        const addSegmentContainer = document.getElementById('add-segment-container');

        const ordenacaoRadios = document.querySelectorAll('input[name="ordenacao"]');

        // Máscara telefone: (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
        function maskPhone(value) {
            let v = value.replace(/\D/g, '');
            if (v.length > 11) v = v.substr(0, 11);
            if (v.length > 10) {
                return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            } else if (v.length > 5) {
                return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
            } else if (v.length > 2) {
                return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else if (v.length > 0) {
                return v.replace(/^(\d*)/, '($1');
            }
            return v;
        }

        // Cria e retorna um elemento com atributos e filhos
        function createElem(tag, attrs = {}, children = []) {
            const el = document.createElement(tag);
            for (const key in attrs) {
                if(key === 'class') el.className = attrs[key];
                else if(key ==='text') el.textContent = attrs[key];
                else if(key.startsWith('aria')) el.setAttribute(key, attrs[key]);
                else el[key] = attrs[key];
            }
            children.forEach(child => {
                if(typeof child === 'string') el.appendChild(document.createTextNode(child));
                else el.appendChild(child);
            });
            return el;
        }

        // Ordenação tabela - captura os dados atuais e ordena conforme critério
        function getTableRowsData() {
            const rows = Array.from(tableBody.querySelectorAll('tr'));
            return rows.map(row => {
                const cells = row.children;
                const codigo = Number(cells[0].textContent.trim());
                const fantasia = cells[1].textContent.replace(/\n/g,' ').trim().toUpperCase();
                const agendamentoStr = cells[4].textContent.trim();
                let agendamento = null;
                if(agendamentoStr){
                    const parts = agendamentoStr.split('/');
                    if(parts.length === 3){
                        agendamento = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    }
                }
                return {codigo, fantasia, agendamento, row};
            });
        }

        function ordenarTabela(criterio) {
            const data = getTableRowsData();
            data.sort((a,b)=>{
                if(criterio === 'codigo'){
                    return a.codigo - b.codigo;
                } else if(criterio === 'cliente'){
                    if(a.fantasia < b.fantasia) return -1;
                    if(a.fantasia > b.fantasia) return 1;
                    return 0;
                } else if(criterio === 'data'){
                    if(a.agendamento === null && b.agendamento === null) return 0;
                    if(a.agendamento === null) return 1;
                    if(b.agendamento === null) return -1;
                    return a.agendamento - b.agendamento;
                }
                return 0;
            });
            tableBody.innerHTML = '';
            data.forEach(d => tableBody.appendChild(d.row));
        }

        // Função para ativar exclusão dos registros (liga eventos nos botões vermelhos existentes)
        function ativarBotoesExcluir(){
            const botoesExcluir = document.querySelectorAll('#table-body button.delete-btn');
            botoesExcluir.forEach(btn => {
                btn.removeEventListener('click', handleExcluirClick);
                btn.addEventListener('click', handleExcluirClick);
            });
        }

        // Evento clicar botão excluir registro
        function handleExcluirClick(e){
            const tr = e.target.closest('tr');
            if(tr && confirm('Deseja realmente excluir este registro?')){
                tr.remove();
            }
        }

        // Formulário Adicionar Empresa
        function createAddCompanyForm() {
            addCompanyContainer.innerHTML = '';
            addSegmentContainer.innerHTML = '';
            btnAddCompany.setAttribute('aria-expanded', 'true');
            btnAddSegment.setAttribute('aria-expanded', 'false');

            const form = createElem('form', {id: 'add-company-form', autocomplete: 'off'});

            form.appendChild(createElem('h3', {text: 'Adicionar Empresa'}));

            // Código (chave primária)
            const groupCodigo = createElem('div', {class: 'form-group'});
            const labelCodigo = createElem('label', {for: 'codigo', text: 'Código (chave primária)'});
            const inputCodigo = createElem('input', {type: 'number', id: 'codigo', name: 'codigo', value: nextCompanyCode, readonly: true});
            groupCodigo.appendChild(labelCodigo);
            groupCodigo.appendChild(inputCodigo);
            form.appendChild(groupCodigo);

            // Prioridade
            const groupPrior = createElem('div', {class: 'form-group'});
            const labelPrior = createElem('label', {for: 'prioridade', text: 'Prioridade'});
            const inputPrior = createElem('input', {type: 'number', id: 'prioridade', name: 'prioridade', value: 99, min: 0, max: 99, required: true});
            groupPrior.appendChild(labelPrior);
            groupPrior.appendChild(inputPrior);
            form.appendChild(groupPrior);

            // Nome Fantasia (max 250 caracteres)
            const groupFantasia = createElem('div', {class: 'form-group'});
            const labelFantasia = createElem('label', {for: 'fantasia', text: 'Nome Fantasia da Empresa'});
            const inputFantasia = createElem('input', {type: 'text', id: 'fantasia', name: 'fantasia', maxlength: 250, required: true, placeholder: 'Até 250 caracteres'});
            groupFantasia.appendChild(labelFantasia);
            groupFantasia.appendChild(inputFantasia);
            form.appendChild(groupFantasia);

            // Linha flex: WhatsApp e Contato
            const flexRow1 = createElem('div', {class: 'flex-row'});
            const groupWhatsapp = createElem('div', {class: 'form-group'});
            const labelWhatsapp = createElem('label', {for: 'whatsapp', text: 'WhatsApp'});
            const inputWhatsapp = createElem('input', {type: 'text', id: 'whatsapp', name: 'whatsapp', placeholder: '(xx) xxxxx-xxxx', maxlength: 15, required: true});
            groupWhatsapp.appendChild(labelWhatsapp);
            groupWhatsapp.appendChild(inputWhatsapp);
            flexRow1.appendChild(groupWhatsapp);

            const groupContato = createElem('div', {class: 'form-group'});
            const labelContato = createElem('label', {for: 'contato', text: 'Contato'});
            const inputContato = createElem('input', {type: 'text', id: 'contato', name: 'contato', placeholder: 'Nome ou info', maxlength: 100});
            groupContato.appendChild(labelContato);
            groupContato.appendChild(inputContato);
            flexRow1.appendChild(groupContato);

            form.appendChild(flexRow1);

            // Segunda linha flex (abaixo do whatsapp e contato)
            const flexRow2 = createElem('div', {class: 'flex-row'});
            const groupAgendamento = createElem('div', {class: 'form-group'});
            const labelAgendamento = createElem('label', {for: 'agendamento', text: 'Agendamento'});
            const inputAgendamento = createElem('input', {type: 'date', id: 'agendamento', name: 'agendamento', required: true});
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            inputAgendamento.value = `${yyyy}-${mm}-${dd}`;
            groupAgendamento.appendChild(labelAgendamento);
            groupAgendamento.appendChild(inputAgendamento);
            flexRow2.appendChild(groupAgendamento);

            const groupVendedor = createElem('div', {class: 'form-group'});
            const labelVendedor = createElem('label', {for: 'vendedor', text: 'Vendedor'});
            const inputVendedor = createElem('input', {type: 'text', id: 'vendedor', name: 'vendedor', readonly: true, value: userName});
            groupVendedor.appendChild(labelVendedor);
            groupVendedor.appendChild(inputVendedor);
            flexRow2.appendChild(groupVendedor);

            form.appendChild(flexRow2);

            const btnSubmit = createElem('button', {type: 'submit', text: 'Salvar'});
            form.appendChild(btnSubmit);

            inputWhatsapp.addEventListener('input', (e)=>{
                const pos = inputWhatsapp.selectionStart;
                const originalLength = inputWhatsapp.value.length;
                inputWhatsapp.value = maskPhone(inputWhatsapp.value);
                const newLength = inputWhatsapp.value.length;
                inputWhatsapp.selectionStart = inputWhatsapp.selectionEnd = pos + (newLength - originalLength);
            });

            form.addEventListener('submit', function(e){
                e.preventDefault();
                const codigoValue = inputCodigo.value.trim();
                const priorValue = inputPrior.value.trim();
                const fantasiaValue = inputFantasia.value.trim();
                const whatsappValue = inputWhatsapp.value.trim();
                const contatoValue = inputContato.value.trim();
                const agendamentoValue = inputAgendamento.value;
                const vendedorValue = inputVendedor.value;

                if(fantasiaValue.length === 0){
                    alert('O campo Nome Fantasia da Empresa é obrigatório.');
                    inputFantasia.focus();
                    return;
                }
                if(priorValue === '' || isNaN(priorValue) || priorValue < 0 || priorValue > 99){
                    alert('Informe uma prioridade válida de 0 a 99.');
                    inputPrior.focus();
                    return;
                }
                if(whatsappValue.length === 0){
                    alert('O campo WhatsApp é obrigatório.');
                    inputWhatsapp.focus();
                    return;
                }
                if(isCodeExistsEmpresa(codigoValue)){
                    alert('Código já existe! Código deve ser único.');
                    inputCodigo.focus();
                    return;
                }

                addTableRowEmpresa({
                    codigo: codigoValue,
                    fantasia: fantasiaValue,
                    whatsapp: whatsappValue,
                    contato: contatoValue,
                    agendamento: agendamentoValue,
                    prioridade: priorValue,
                    vendedor: vendedorValue,
                    segmentos: "-"
                });
                nextCompanyCode++;
                addCompanyContainer.innerHTML = '';
                btnAddCompany.setAttribute('aria-expanded', 'false');
                btnAddCompany.focus();
                ordenarTabela(document.querySelector('input[name="ordenacao"]:checked').value);
            });

            return form;
        }

        function isCodeExistsEmpresa(code) {
            const rows = tableBody.querySelectorAll('tr');
            for(const row of rows) {
                const codigoCell = row.children[0];
                if(codigoCell && codigoCell.textContent.trim() === String(code)) {
                    return true;
                }
            }
            return false;
        }

        function addTableRowEmpresa({codigo, fantasia, whatsapp, contato, agendamento, prioridade, vendedor, segmentos}) {
            const tr = document.createElement('tr');
            tr.tabIndex = 0;

            const tdCodigo = createElem('td', {text: codigo});
            tr.appendChild(tdCodigo);

            const fantasiaHtml = fantasia.split(' ').join('<br>');
            const tdFantasia = document.createElement('td');
            tdFantasia.innerHTML = fantasiaHtml;
            tr.appendChild(tdFantasia);

            const tdWhatsapp = createElem('td');
            tdWhatsapp.innerHTML = `<span class="whatsapp-icon" aria-hidden="true">📞</span> ${whatsapp}`;
            tr.appendChild(tdWhatsapp);

            const tdContato = createElem('td');
            tdContato.innerHTML = `<span class="contact-icon" aria-hidden="true">👤</span> ${contato || ''}`;
            tr.appendChild(tdContato);

            let agendamentoFormatado = '';
            if(agendamento) {
                const dateObj = new Date(agendamento);
                if(!isNaN(dateObj.getTime())){
                    agendamentoFormatado = `${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;
                }
            }
            tr.appendChild(createElem('td', {text: agendamentoFormatado}));

            const tdPrior = createElem('td');
            const badge = createElem('div', {class: 'badge', text: prioridade});
            tdPrior.appendChild(badge);
            tr.appendChild(tdPrior);

            tr.appendChild(createElem('td', {text: vendedor}));
            tr.appendChild(createElem('td', {text: segmentos}));

            const tdAcoes = createElem('td');
            const btnAlterar = createElem('button', {type: 'button', text: 'Alteração', 'aria-label': `Alterar registro código ${codigo}`});
            btnAlterar.addEventListener('click', () => {
                alert(`Função de alteração ainda não implementada. Código: ${codigo}`);
            });
            tdAcoes.appendChild(btnAlterar);

            const btnExcluir = createElem('button', {type: 'button', text: '🗑', 'aria-label': `Excluir registro código ${codigo}`, class: 'delete-btn'});
            btnExcluir.style.padding = '3px 6px';
            btnExcluir.addEventListener('click', () => {
                if(confirm(`Deseja realmente excluir o registro código ${codigo}?`)){
                    tr.remove();
                }
            });
            tdAcoes.appendChild(btnExcluir);

            tr.appendChild(tdAcoes);

            tableBody.appendChild(tr);
            ativarBotoesExcluir();
        }

        // Formulário Adicionar Segmento
        function createAddSegmentForm() {
            addCompanyContainer.innerHTML = '';
            addSegmentContainer.innerHTML = '';
            btnAddSegment.setAttribute('aria-expanded', 'true');
            btnAddCompany.setAttribute('aria-expanded', 'false');

            const wrapper = createElem('div');

            const form = createElem('form', {id: 'add-segment-form', autocomplete: 'off'});

            form.appendChild(createElem('h3', {text: 'Cadastro de Segmento'}));

            const groupCodigo = createElem('div', {class: 'form-group'});
            const labelCodigo = createElem('label', {for: 'codigo-seg', text: 'Código (chave primária)'});
            const inputCodigo = createElem('input', {type: 'number', id: 'codigo-seg', name: 'codigo-seg', value: nextSegmentCode, readonly: true});
            groupCodigo.appendChild(labelCodigo);
            groupCodigo.appendChild(inputCodigo);
            form.appendChild(groupCodigo);

            const groupDesc = createElem('div', {class: 'form-group'});
            const labelDesc = createElem('label', {for: 'descricao-seg', text: 'Descrição do Segmento'});
            const inputDesc = createElem('input', {type: 'text', id: 'descricao-seg', name: 'descricao-seg', maxlength: 250, placeholder: 'Descrição do segmento', required: true});
            groupDesc.appendChild(labelDesc);
            groupDesc.appendChild(inputDesc);
            form.appendChild(groupDesc);

            const btnAddSeg = createElem('button', {type: 'submit', text: 'Adicionar Segmento'});
            form.appendChild(btnAddSeg);

            const listContainer = createElem('div', {id: 'segment-list'});
            listContainer.appendChild(createElem('h4', {text: 'Segmentos Cadastrados'}));
            const ul = createElem('ul');
            listContainer.appendChild(ul);

            wrapper.appendChild(form);
            wrapper.appendChild(listContainer);
            addSegmentContainer.appendChild(wrapper);

            const segments = [];

            function renderSegmentList(){
                ul.innerHTML = '';
                if(segments.length === 0){
                    const li = createElem('li', {text: 'Nenhum segmento cadastrado.'});
                    ul.appendChild(li);
                    return;
                }
                segments.forEach((seg) => {
                    const li = createElem('li');
                    li.textContent = `#${seg.codigo} - ${seg.descricao}`;
                    const btnDel = createElem('button', {class: 'delete-seg-btn', ariaLabel: 'Excluir segmento', text: '🗑'});
                    btnDel.addEventListener('click', ()=>{
                        if(confirm(`Deseja excluir o segmento código ${seg.codigo}?`)){
                            const index = segments.findIndex(s => s.codigo === seg.codigo);
                            if(index > -1){
                                segments.splice(index,1);
                                renderSegmentList();
                            }
                        }
                    });
                    li.appendChild(btnDel);
                    ul.appendChild(li);
                });
            }

            renderSegmentList();

            form.addEventListener('submit', (e)=>{
                e.preventDefault();

                const codigoVal = Number(inputCodigo.value);
                const descricaoVal = inputDesc.value.trim();

                if(descricaoVal.length === 0){
                    alert('Descrição do segmento é obrigatória.');
                    inputDesc.focus();
                    return;
                }

                if(segments.some(s => s.codigo === codigoVal)){
                    alert('Código de segmento já existe.');
                    return;
                }

                segments.push({codigo: codigoVal, descricao: descricaoVal});
                nextSegmentCode++;
                inputCodigo.value = nextSegmentCode;
                inputDesc.value = '';
                inputDesc.focus();

                renderSegmentList();
            });

            return wrapper;
        }

        // Eventos para toggle formularios
        btnAddCompany.addEventListener('click', () => {
            if(addCompanyContainer.innerHTML.trim() === ''){
                const form = createAddCompanyForm();
                addCompanyContainer.appendChild(form);
                btnAddCompany.setAttribute('aria-expanded', 'true');
                btnAddSegment.setAttribute('aria-expanded', 'false');
            } else {
                addCompanyContainer.innerHTML = '';
                btnAddCompany.setAttribute('aria-expanded', 'false');
            }
            addSegmentContainer.innerHTML = '';
        });

        btnAddSegment.addEventListener('click', () => {
            if(addSegmentContainer.innerHTML.trim() === ''){
                const form = createAddSegmentForm();
                addSegmentContainer.appendChild(form);
                btnAddSegment.setAttribute('aria-expanded', 'true');
                btnAddCompany.setAttribute('aria-expanded', 'false');
            } else {
                addSegmentContainer.innerHTML = '';
                btnAddSegment.setAttribute('aria-expanded', 'false');
            }
            addCompanyContainer.innerHTML = '';
        });

        // Ordenação tabela evento
        ordenacaoRadios.forEach(radio => {
            radio.addEventListener('change', (e)=>{
                if(e.target.checked){
                    ordenarTabela(e.target.value);
                }
            });
        });

        // Ordena tabela inicial por código
        ordenarTabela('codigo');

        // Ativa exclusão botões já existentes
        function ativarBotoesExcluir() {
            const botoesExcluir = document.querySelectorAll('#table-body button.delete-btn');
            botoesExcluir.forEach(btn => {
                btn.removeEventListener('click', handleExcluirClick);
                btn.addEventListener('click', handleExcluirClick);
            });
        }
        function handleExcluirClick(e) {
            const tr = e.target.closest('tr');
            if(tr && confirm('Deseja realmente excluir este registro?')){
                tr.remove();
            }
        }
        ativarBotoesExcluir();

    })();
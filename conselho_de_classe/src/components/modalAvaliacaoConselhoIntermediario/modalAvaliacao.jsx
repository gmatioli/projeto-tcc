const ModalAvaliacao = ({ isOpen, onClose }) => {
  // Se isOpen for falso, não renderiza nada
  if (!isOpen) return null;

  return (
    // Fundo escuro do modal
    <div style={styles.overlay}>
      {/* Caixa branca do formulário */}
      <div style={styles.modal}>
        <h2 style={styles.title}>Avaliando Alunos Selecionados</h2>
        <hr />
        
        <form>
          <div style={styles.inputGroup}>
            <label>Restrição:</label>
            <input type="text" placeholder="Ex: Faltas Injustificadas..." style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Ação Proposta:</label>
            <input type="text" placeholder="Ex: Solicitar comparecimento..." style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Responsável(*):</label>
            <select style={styles.input}>
              <option>Assistente da Qualidade de Vida</option>
              <option>Outro...</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label>Natureza da Ocorrência:</label>
            <div style={styles.checkboxGroup}>
              <label><input type="checkbox" /> Comportamental</label>
              <label style={{ marginLeft: '10px' }}><input type="checkbox" /> Aproveitamento Escolar</label>
              <label style={{ marginLeft: '10px' }}><input type="checkbox" /> Frequência</label>
              <label style={{ marginLeft: '10px' }}><input type="checkbox" /> Outro: <input type="text" /></label>
            </div>
          </div>

          <hr style={{marginTop: '100px'}}/>
          
          <div style={styles.buttonGroup}>
            {/* O botão Cancelar chama a função onClose que vem das props */}
            <button type="button" onClick={onClose} style={styles.btnCancel}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnSave}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Estilos básicos apenas para o exemplo funcionar visualmente
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginLeft: '18vw', marginTop: '8vh', 
    width: '1200px', maxWidth: '90%', height: '800px',
    display: 'flex', flexDirection: 'column'
  },
    title: { textAlign: 'center', marginTop: '20px', marginBottom: '10px'},
    inputGroup: { marginBottom: '15px', marginTop: '50px', display: 'flex', flexDirection: 'column' },
    input: { padding: '20px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' },
    checkboxGroup: {display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '75px', marginTop: '25px'},
    buttonGroup: { display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '20px', alignItems: 'end' },
    btnCancel: { padding: '20px 120px', borderRadius: '50px', border: '1px solid #ccc', cursor: 'pointer' },
    btnSave: { padding: '20px 120px', borderRadius: '50px', border: 'none', backgroundColor: '#e53935', color: '#fff', cursor: 'pointer' }
};

export default ModalAvaliacao;
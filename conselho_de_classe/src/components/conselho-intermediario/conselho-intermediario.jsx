import './conselho-intermediario.css'

import totalAlunosIcon from '../../assets/conselho-intermediario/total-alunos-icon.svg'
import situacaoNormalIcon from '../../assets/conselho-intermediario/situacao-normal-icon.svg'
import restritosIcon from '../../assets/conselho-intermediario/restritos-icon.svg'
import retidosIcon from '../../assets/conselho-intermediario/retidos-icon.svg'
import notificationIcon from '../../assets/conselho-intermediario/notification-icon.svg'

const intTotalAlunos = 20
const intSituacaoNormal = 16
const intRestritos = 4
const intRetidos = 0
const intObservacoes = 3

export function ConselhoIntermediario() {

  return (
      <section>
        <div className="content_conselho_intermediario">
            <div className="cards_turma_info">
                <div className="card_total_alunos">
                    <div className="int_text_total_alunos">
                        <h3 className="int_total_alunos">{intTotalAlunos}</h3>
                        <p className="text_total_alunos">Total de Alunos</p>
                    </div>
                    <div className="icon">
                        <img src={totalAlunosIcon} alt="" />
                    </div>
                </div>
                <div className="card_situacao_normal">
                    <div className="int_text_situacao_normal">
                        <h3 className="int_situacao_normal">{intSituacaoNormal}</h3>
                        <p className="text_situacao_normal">Total de Alunos</p>
                    </div>
                    <div className="icon">
                        <img src={situacaoNormalIcon} alt="" />
                    </div>
                </div>
                <div className="card_restritos">
                    <div className="int_text_restritos">
                        <h3 className="int_restritos">{intRestritos}</h3>
                        <p className="text_restritos">Total de Alunos</p>
                    </div>
                    <div className="icon">
                        <img src={restritosIcon} alt="" />
                    </div>
                </div>
                <div className="card_retidos">
                    <div className="int_text_retidos">
                        <h3 className="int_retidos">{intRetidos}</h3>
                        <p className="text_retidos">Total de Alunos</p>
                    </div>
                    <div className="icon">
                        <img src={retidosIcon} alt="" />
                    </div>
                </div>
                <div className="card_avaliacoes">
                    <div className="buttons_avaliacoes">
                        <button className="avaliar_toda_turma">
                            Avaliar Toda Turma
                        </button>
                        <button className="limpar_selecao">
                            Limpar Seleção
                        </button>
                        <button className="avaliar_selecionados">
                            Avaliar Selecionados
                        </button>
                    </div>
                </div>
            </div>
            <div className="card_alunos">
                <div className="top_tabela_alunos">
                    <div className="checkbox_selecionar_tudo">
                        <input type="checkbox" id="checkbox_selecionar_tudo" />
                        <p>Selecionar Tudo</p>
                    </div>
                    <div className="quatidade_alunos_selecionados">
                        <p>Alunos Selecionados: 0</p>
                    </div>
                </div>
                <div className="container_tabela_alunos">
                    <div className="tabela_alunos">
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            <div className="div_aluno">
                                <div className="div_aluno_info">
                                    <input type="checkbox" id="checkbox_aluno" />
                                    <p>Jorge Marques de Salves</p>
                                    <div className="img_text_observacoes">
                                        <img src={notificationIcon} alt="" />
                                        <div className="div_observacoes">
                                            <p>Ver Observações</p>
                                            <p>({intObservacoes})</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="div_btn_restrito">
                                    <button className="btn_restrito">Restrito</button>
                                </div>
                            </div>
                            <hr />
                            
                    </div>
                </div>
                
            </div>
        </div>
      </section>
      
  )
}
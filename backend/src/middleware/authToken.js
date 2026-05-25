const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ sucesso: false, mensagem: 'Token ausente.' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET); // { idUsuario, nivelAcesso }
    next();
  } catch {
    return res.status(401).json({ sucesso: false, mensagem: 'Token inválido ou expirado.' });
  }
}

// opcional: exigir um nível específico (ex.: só admin)
function exigirNivel(nivel) {
  return (req, res, next) => {
    if (req.usuario?.nivelAcesso !== nivel)
      return res.status(403).json({ sucesso: false, mensagem: 'Acesso negado.' });
    next();
  };
}

module.exports = { autenticar, exigirNivel };
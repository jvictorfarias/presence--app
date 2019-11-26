import * as Yup from 'yup';
import bcrypt from 'bcrypt';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    /**
     * Validação do objeto student
     */
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      matriculation: Yup.string().required(),
      password: Yup.string()
        .min(8)
        .required()
    });

    /**
     * Caso seja inválido, retorna status de erro
     */

    if (!(await schema.isValid(req.body))) {
      return res.status(403).json({ error: 'Data not valid' });
    }

    /**
     * Verifica se já existe algum aluno com essa matrícula
     */

    if (await Student.findOne({ matriculation: req.body.matriculation })) {
      return res.status(401).json({ error: 'student already exists' });
    }

    /**
     * Cria o aluno
     */

    /** Encripta a senha do aluno  */
    req.body.password_hash = await bcrypt.hash(req.body.password, 8);

    const { id, name, matriculation } = await Student.create(req.body);
    return res.json({
      id,
      name,
      matriculation
    });
  }

  async show(req, res) {
    /**
     * Verifica se o objeto para validação está correto
     */
    const schema = Yup.object().shape({
      matriculation: Yup.string().required(),
      password: Yup.string()
        .min(8)
        .required()
    });

    /**
     * Caso o objeto não seja válido, retorna status de erro
     */

    if (!(await schema.isValid(req.body))) {
      return res.status(403).json({ error: 'bad request' });
    }

    /**
     * Busca pelo usuário já validado
     */
    const student = await Student.findOne({
      matriculation: req.body.matriculation
    });

    /**
     * Caso o usuário não seja encontrado, retorna erro
     */
    if (!student) {
      return res.status(400).json({ error: 'student not found' });
    }

    /**
     * Verifica se a senha do usuário está correta e encriptada
     */

    if (!(await bcrypt.compare(req.body.password, student.password_hash))) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    /**
     * Retorna o usuário para que ele possa ser direcionado ao feed
     */
    const { id, name, matriculation } = student;
    return res.status(200).json({
      id,
      name,
      matriculation
    });
  }
}

export default new StudentController();

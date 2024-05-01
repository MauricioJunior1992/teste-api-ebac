/// <reference types="cypress" />
import usuarios from '../contracts/usuarios.contract'
import {faker} from '@faker-js/faker'

describe('Testes da Funcionalidade Usuários', () => {
  var token
  beforeEach(() => {
    cy.token('fulano@qa.com', 'teste').then(tkn =>{
      token = tkn
    })
  })
  it('Deve validar contrato de usuários', () => {
    cy.request('usuarios').then(response => {
      return usuarios.validateAsync(response.body)
    })
  });

  it('Deve listar usuários cadastrados', () => {
    cy.request({
      method: 'GET',
      url: 'usuarios'
    }).should((response) => {
      expect(response.status).equal(200)
      expect(response.body).to.property('usuarios')
    })
  })

  it('Deve cadastrar um usuário com sucesso', () => {
    var usuario = 'Usuario Teste ' + Math.floor(Math.random() * 100000)
    var email = 'emailteste' + Math.floor(Math.random() * 100000) + "@qa.com.br"
    //var usuarioFaker = faker.person.name ()
    //var emailFaker = faker.internet.email(usuarioFaker)
    cy.CadastrarUsuario(token, usuario, email, 'teste', 'true')
    .should((response) => {
      expect(response.status).equal(201)
      expect(response.body.message).equal('Cadastro realizado com sucesso')
    })
  })

  it('Deve validar um usuário com email inválido', () => {
    var usuario = 'Usuario Teste ' + Math.floor(Math.random() * 100000)
    cy.CadastrarUsuario(token, usuario, 'beltrano@qa.com.br', 'teste', 'true')
    .should((response) => {
      expect(response.status).equal(400)
      expect(response.body.message).equal('Este email já está sendo usado')
    })
  });

  it('Deve editar um usuário previamente cadastrado', () => {
    var usuario = 'Usuário para editar ' + Math.floor(Math.random() * 100000)
    var email = 'emailparaeditar' + Math.floor(Math.random() * 100000) + "@qa.com.br"
    cy.CadastrarUsuario(token, usuario, email, 'senhaparalterar', 'true')
      .then(response =>{
        var id = response.body._id
      cy.request({
      method: 'PUT',
      //url: `usuarios/${id}`,
      url: 'usuarios' + '/' + id,
      headers: {authorization: token},
      body:
      {
        nome: "Usuário alterado" + Math.floor(Math.random() * 100000),
        email: 'emailalterado' + Math.floor(Math.random() * 100000) + '@qa.com.br',
        password:'senhalterada',
        administrador: 'true'
      }
      })
    })
    .should(response => {
      expect(response.body.message).equal('Registro alterado com sucesso')
      expect(response.status).equal(200)
    })
  });

  it('Deve deletar um usuário previamente cadastrado', () => {
    cy.CadastrarUsuario(token, 'Usuário EBAC para deletar', 'emailparadeletar@qa.com.br', 'testedelete', 'true')
      .then(response =>{
        var id = response.body._id
        cy.request({
          method: 'DELETE',
          //url: `usuarios/${id}`,
          url: 'usuarios' + '/' + id,
          headers: {authorization: token}
        })
        .should(response => {
          expect(response.body.message).equal('Registro excluído com sucesso')
          expect(response.status).equal(200)
        })
      }) 
  });
});
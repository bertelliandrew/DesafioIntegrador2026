# Módulo de IA

Este módulo usa Python e Random Forest para gerar uma classificação simples dos clientes.

## Objetivo

Gerar dois indicadores:

- risco de churn: chance do cliente cancelar;
- propensão de compra: chance do cliente contratar/expandir o plano.

## Como instalar

Dentro da pasta raiz do projeto:

```bash
cd ia
pip install -r requirements.txt
python treinar_modelo.py
```

## Como funciona

O treinamento usa o arquivo `dados_treinamento.csv`, com dados sintéticos baseados nas regras do sistema.

O tratamento de dados aplicado é simples:

- remoção de registros duplicados;
- preenchimento de valores vazios com zero;
- tratamento de outliers usando IQR;
- normalização dos dados com Min-Max.

O backend NestJS chama o script `prever_clientes.py` para obter o ranking dos clientes cadastrados.

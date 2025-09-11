'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign,
  Calculator,
  Gift,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react'
import { 
  arbitragensAPI, 
  ganhosAPI, 
  percasAPI, 
  freespinsAPI 
} from '../../../lib/api'
import { useAuth } from '../../../components/AuthProvider'

interface DadosMensais {
  mes: string;
  lucro: number;
  arbitragens: number;
  freebets: number;
  ganhos: number;
  freespins: number;
  perdas: number;
}

export default function RelatoriosPage() {
  const [dadosMensais, setDadosMensais] = useState<DadosMensais[]>([])
  const [loading, setLoading] = useState(true)
  const { usuario } = useAuth()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [arbitragens, ganhos, perdas, freespins] = await Promise.all([
          arbitragensAPI.getAll(),
          ganhosAPI.getAll(),
          percasAPI.getAll(),
          freespinsAPI.getAll()
        ])

        // Processar dados mensais
        const dadosProcessados = processarDadosMensais(arbitragens, ganhos, perdas, freespins)
        console.log('Dados processados:', dadosProcessados)
        console.log('Arbitragens:', arbitragens)
        console.log('Ganhos:', ganhos)
        console.log('Perdas:', perdas)
        console.log('Freespins:', freespins)
        
        // Log específico para freebets
        const totalFreebets = dadosProcessados.reduce((sum, mes) => sum + mes.freebets, 0)
        console.log('Total de freebets calculado:', totalFreebets)
        
        setDadosMensais(dadosProcessados)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  function processarDadosMensais(arbitragens: any[], ganhos: any[], perdas: any[], freespins: any[]) {
    const meses: { [key: string]: DadosMensais } = {}

    // Processar arbitragens
    arbitragens.forEach(arb => {
      const data = new Date(arb.data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      
      if (!meses[chave]) {
        meses[chave] = {
          mes: mesNome,
          lucro: 0,
          arbitragens: 0,
          freebets: 0,
          ganhos: 0,
          freespins: 0,
          perdas: 0
        }
      }
      
      meses[chave].arbitragens += 1
      // Calcular lucro baseado no lucroReal ou lucroEsperado
      const lucroArbitragem = arb.lucroReal || arb.lucroEsperado || 0
      meses[chave].lucro += lucroArbitragem
      
      // Calcular lucro das freebets baseado no lucroReal das arbitragens que usaram freebets
      let lucroFreebets = 0
      const temFreebet = arb.freebet1 || arb.freebet2 || arb.freebet3 || arb.freebet4 || arb.freebet5
      
      if (temFreebet && arb.lucroReal) {
        // Se a arbitragem usou freebet e tem lucro real, adiciona o lucro real
        lucroFreebets = arb.lucroReal
        console.log(`Arbitragem ${arb.id} com freebet: lucroReal=${arb.lucroReal}, freebets=${arb.freebet1},${arb.freebet2},${arb.freebet3},${arb.freebet4},${arb.freebet5}`)
      }
      
      meses[chave].freebets += lucroFreebets
    })

    // Processar ganhos
    ganhos.forEach(ganho => {
      const data = new Date(ganho.data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      
      if (!meses[chave]) {
        meses[chave] = {
          mes: mesNome,
          lucro: 0,
          arbitragens: 0,
          freebets: 0,
          ganhos: 0,
          freespins: 0,
          perdas: 0
        }
      }
      
      meses[chave].ganhos += ganho.valor
      meses[chave].lucro += ganho.valor // Adicionar ganhos ao lucro
    })

    // Processar perdas
    perdas.forEach(perda => {
      const data = new Date(perda.data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      
      if (!meses[chave]) {
        meses[chave] = {
          mes: mesNome,
          lucro: 0,
          arbitragens: 0,
          freebets: 0,
          ganhos: 0,
          freespins: 0,
          perdas: 0
        }
      }
      
      meses[chave].perdas += perda.valor
      meses[chave].lucro -= perda.valor // Subtrair perdas do lucro
    })

    // Processar freespins
    freespins.forEach(freespin => {
      const data = new Date(freespin.data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      
      if (!meses[chave]) {
        meses[chave] = {
          mes: mesNome,
          lucro: 0,
          arbitragens: 0,
          freebets: 0,
          ganhos: 0,
          freespins: 0,
          perdas: 0
        }
      }
      
      meses[chave].freespins += freespin.valorGanho
      meses[chave].lucro += freespin.valorGanho // Adicionar freespins ao lucro
    })

    // Ordenar por data
    return Object.values(meses).sort((a, b) => {
      const [mesA, anoA] = a.mes.split(' de ')
      const [mesB, anoB] = b.mes.split(' de ')
      
      const mesesIndex = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
      const indiceMesA = mesesIndex.indexOf(mesA)
      const indiceMesB = mesesIndex.indexOf(mesB)
      
      const dataA = new Date(parseInt(anoA), indiceMesA)
      const dataB = new Date(parseInt(anoB), indiceMesB)
      
      return dataA.getTime() - dataB.getTime()
    })
  }

  function calcularResumoExecutivo() {
    const totalLucro = dadosMensais.reduce((sum, mes) => sum + mes.lucro, 0)
    const mediaMensal = dadosMensais.length > 0 ? totalLucro / dadosMensais.length : 0
    const melhorMes = dadosMensais.length > 0 ? Math.max(...dadosMensais.map(m => m.lucro)) : 0
    const piorMes = dadosMensais.length > 0 ? Math.min(...dadosMensais.map(m => m.lucro)) : 0
    const totalArbitragens = dadosMensais.reduce((sum, mes) => sum + mes.arbitragens, 0)
    const totalFreebets = dadosMensais.reduce((sum, mes) => sum + mes.freebets, 0)

    return {
      totalLucro,
      mediaMensal,
      melhorMes,
      piorMes,
      totalArbitragens,
      totalFreebets
    }
  }

  const resumo = calcularResumoExecutivo()

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Carregando relatórios...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resumo Executivo - Lucro Mensal</h1>
      </div>

      {/* Resumo Executivo - Dentro de uma caixa */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo Executivo - Lucro Mensal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lucro Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {resumo.totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média Mensal</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {resumo.mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Melhor Mês</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {resumo.melhorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
        <div>
                  <p className="text-sm font-medium text-gray-600">Pior Mês</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {resumo.piorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
        </div>
        </div>
      </div>

      {/* Cards de resumo detalhado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Total</p>
              <p className="text-xl font-bold text-green-600">
                R$ {resumo.totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Arbitragens</p>
              <p className="text-xl font-bold text-blue-600">{resumo.totalArbitragens}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Freebets Extraídos</p>
              <p className="text-xl font-bold text-purple-600">
                R$ {resumo.totalFreebets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média Mensal</p>
              <p className="text-xl font-bold text-orange-600">
                R$ {resumo.mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lucro Mensal Detalhado - Dentro de uma caixa */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lucro Mensal Detalhado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dadosMensais.map((mes, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{mes.mes}</h3>
                  <div className="text-2xl font-bold text-green-600 mb-4">
                    R$ {mes.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Arbitragens:</span>
                    <span className="text-sm font-medium text-gray-900">{mes.arbitragens}</span>
          </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Freebets:</span>
                    <span className="text-sm font-medium text-gray-900">
                      R$ {mes.freebets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
        </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ganhos:</span>
                    <span className="text-sm font-medium text-green-600">
                      R$ {mes.ganhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
      </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Freespins:</span>
                    <span className="text-sm font-medium text-purple-600">
                      R$ {mes.freespins.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
        </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Perdas:</span>
                    <span className="text-sm font-medium text-red-600">
                      R$ {mes.perdas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
          </div>
        </div>
      </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
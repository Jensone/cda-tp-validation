import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import load from '../../assets/load.gif'

// Chargement du package OpenAI
import OpenAI from 'openai'

function Chat() {
    const location = useLocation()
    const navigate = useNavigate()
    const formData = location.state?.formData

    // Configuration de l'API OpenAI
    const openai = new OpenAI({
        dangerouslyAllowBrowser: true,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Clé API depuis le fichier .env.local
    })
    const prePrompt = `Agis comme un chatbot qui répond à aux questions de ${formData.name}. 
                    Répond en commençant par son prénom et une salutation originale. La thématique est ${formData.subject}. Voici sa question : `
    const [prompt, setPrompt] = useState('') // Constante pour le prompt à envoyer à l'API
    const [apiResponse, setApiResponse] = useState('') // Constante pour la réponse de l'API
    const [loading, setLoading] = useState(false) // Constante pour le chargement en cours

    // Fonction pour envoyer le prompt à l'API
    const handleSubmit = async e => {
        // Fonction asynchrone car on utilise await
        e.preventDefault() // Empêche le rechargement de la page
        setLoading(true) // On met le chargement à true
        try {
            const result = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo-0613', // Modèle à utiliser
                messages: [{ role: 'user', content: prePrompt + prompt }], // Prompt à envoyer à l'API
            })
            console.log(result.choices[0].message.content) // On affiche la réponse dans la console pour le débug
            setApiResponse(result.choices[0].message.content) // On met la réponse de l'API dans la constante
        } catch (error) {
            setApiResponse('Une erreur est survenue') // On informe l'utilisateur d'une erreur
        }
        setLoading(false) // On met le chargement à false
    }

    useEffect(() => {
        if (formData.name && formData.subject) {
            // Si on a bien le nom et le sujet
            confetti({
                // On lance les confettis
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            })
        } else {
            // Sinon on redirige vers la page d'accueil
            navigate('/')
        }
    }, [formData, navigate])

    if (!formData) {
        // Si on a pas de données, on redirige vers la page d'accueil
        return null
    }

    return (
        <main className="text-center">
            <h1 className="form-signin col-md-6 col-sm-10 m-auto mb-3">
                Bienvenue, {formData.name}
            </h1>
            <h3>Pose-moi tes questions sur {formData.subject}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                    <textarea
                        className="form-control"
                        placeholder="Pose ta question ici"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                    ></textarea>
                </div>
                <button
                    className="btn btn-warning rounded-pill"
                    type="submit"
                    disabled={loading || prompt.length === 0}
                >
                    Envoyer
                </button>
            </form>
            <div className='mt-3'>
                {loading && <img src={load} alt="Chargement" width={50} />}
                <br />
                <code className="text-left text-dark col-md-6 col-sm-10 m-auto p-3 my-3">
                    {apiResponse}
                </code>
            </div>
        </main>
    )
}

export default Chat

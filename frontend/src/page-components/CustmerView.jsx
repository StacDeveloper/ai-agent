import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { usePolling } from '../lib/usePolling';
import { api, formatDateTime } from '../api/api';

const TEST_CUSTOMERS = [
  { id: 'cust_1042', name: 'Soham Mule', phone: '+91 9871237683' },
  { id: 'cust_1043', name: 'Ayush Ghadghe', phone: '+91 9936549271' },
  { id: 'cust_1044', name: 'Aryan Bhadjoshi', phone: '+91 9982634861' },
]

const samples = [
  "Hi, my order #4471 hasn't arrived yet. Can I change the delivery address?",
  'What is your return policy?',
  'Do you deliver to Dubai?',
  'Is cash on delivery available for a ₹3,500 order?',
  "I think I'm allergic to the serum I bought. What should I do?",
];


const CustomerView = () => {
  const [choice, setChoice] = useState('cust_1042')
  const [custom, setCustom] = useState({ name: '', phone: '' })
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endReft = useRef(null)

  const url = import.meta.env.VITE_BASE_URL

  const customer = choice === 'custom'
    ? { id: `cust_web_${custom.phone.replace(/\D/g, '')}`, name: custom.name.trim(), phone: custom.phone.trim() }
    : TEST_CUSTOMERS.find((c) => c.id === choice);
  const customerReady = choice !== 'custom' || (customer.name && customer.phone.replace(/\D/g, '').length >= 6);

  const chat = usePolling(() => (customerReady ? api.get(`${url}/api/customer/conversations/${encodeURIComponent(customer.id)}`) : Promise.resolve({ messages: [] })), 3000, [customer.id, customerReady])

  const messages = chat.data?.messages ?? []

  useEffect(() => {
    endReft.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])


  async function send() {
    if (!text.trim() || sending || !customerReady) return;
    setSending(true)
    setError('')
    try {
      await api.post(`${url}/api/customer/messages`, { customer, text })
      setText('')
      chat.refresh()
    } catch (error) {
      setError(error.message || 'Failed to send Message!')
    }
    finally {
      setSending(false)
    }
  }

  return (
    <section className='chat-page'>
      <div className='who'>
        <label>
          Chatting as
          <select value={choice} onChange={(e) => { setChoice(e.target.value); setError('') }}>
            {TEST_CUSTOMERS.map((cust) => <option key={cust.id} value={cust.id}>{cust.name} ({cust.phone}) </option>)}
            <option value={'custom'}>Someone else</option>
          </select>
        </label>
        {choice === 'custom' && (
          <div className='row'>
            <input placeholder='Name' value={custom.name} maxLength={100} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
            <input placeholder='Phone, eg. +91 98000000010' value={custom.phone} maxLength={20} onChange={(e) => setCustom({ ...custom, phone: e.target.value })} />
            |</div>
        )}
      </div>

      <div className='thread' aria-live='polite'>
        {chat.error && !messages.length && <p className='notice error'>{chat.error.message}</p>}
        {!messages.length && !chat.error && (<p className='empty'>{customerReady ? 'No messages yet. Send one below and the team reply will appear here.' : 'Enter a name and phone number to start'}</p>)}
        {messages.map((msg) => (
          <div key={msg.id} className={`bubble ${msg.sender === 'customer' ? 'mine' : 'theirs'}`}>
            {msg.sender === 'agent' && <b>Verdant &amp; Co team</b>}
            <p>{msg.text}</p>
            <time>{formatDateTime(msg.created_at)}</time>
          </div>
        ))}
        <div ref={endReft} />
      </div>
      <div className='samples'>
        {samples.map((samp) => <button key={samp} className='chip' onClick={() => setText(samp)}>{samp}</button>)}
      </div>
      {error && <p className='notice error' role='alert'>{error}</p>}
      <div className='composer'>
        <textarea
          rows={2}
          value={text}
          maxLength={2000}
          placeholder='Type a message'
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        />

        <button className='primary' onClick={send} disabled={sending || !text.trim() || !customerReady}>
          {sending ? 'Sending' : 'Send Message'}
        </button>
      </div>

    </section>
  )
}

export default CustomerView

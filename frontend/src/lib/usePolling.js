import { useEffect, useState, useRef } from "react";

export const usePolling = (fetcher, intervalMs, deps = []) => {
    const [state, setState] = useState({ data: null, error: null, loaded: false })
    const fetchRef = useRef(fetcher)
    fetchRef.current = fetcher
    const tickRef = useRef(() => { })

    useEffect(() => {
        let cancelled = false;
        let timer;
        let seq = 0
        setState({ data: null, error: null, loaded: false })

        const tick = async () => {
            clearTimeout(timer)
            const mine = ++seq
            try {
                const data = await fetchRef.current()
                if (!cancelled && mine === seq) setState({ data, error: null, loaded: true })
            } catch (error) {
                if (!cancelled && mine === seq) setState((d) => ({ ...d, error, loaded: true }))
            }
            if (!cancelled && mine === seq) timer = setTimeout(tick, document.hidden ? intervalMs * 5 : intervalMs)
        }
        tickRef.current = tick;
        tick()

        return () => {
            cancelled = true;
            clearTimeout(timer)
        }

    }, deps)


    return { ...state, refresh: () => tickRef.current() }

}
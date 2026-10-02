export function useCounter() {
  const counter = useLocalStorage('counter', 0)


  // !for localstorage simple  {#ebf,12}
  // onMounted(() => {
  //   const saved = localStorage.getItem('counter')
  //   if (saved !== null && Number.isFinite(Number(saved))) {
  //     counter.value = Number(saved)
  //   }
  // })


  // watch(counter, (value) => {
  //   if (import.meta.client) localStorage.setItem('counter', String(value))
  // })


  const incresment = () => counter.value++
  const decrement = () => {if (counter.value >0 ) counter.value-- }


  return {counter, incresment, decrement}
}
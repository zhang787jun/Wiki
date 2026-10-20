// Simiki/Pygments does not retain fenced-code language names. Only complete
// graph/flowchart blocks are enhanced; tutorial fences and other code stay intact.
const blocks=[...document.querySelectorAll('.article-body .hlcode, .article-content .hlcode, .hlcode')].filter(el=>/^\s*(?:graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\s*\n/.test(el.querySelector('pre')?.textContent||''));
if(blocks.length){
  try {
    const {mount}=await import('./vendor/pele/pele.js');
    await document.fonts.ready;
    blocks.forEach((block,i)=>{
      const figure=document.createElement('figure');figure.className='pele-diagram';
      const chart=document.createElement('div');chart.className='pele-chart';chart.setAttribute('role','img');chart.setAttribute('aria-label','流程图；完整节点与连接见下方图表源代码');
      const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='查看图表源代码';details.append(summary);
      const code=block.querySelector('pre').cloneNode(true);
      code.querySelectorAll('button').forEach(button=>button.remove());
      const source=code.textContent;
      block.before(figure);figure.append(chart);
      try{const mounted=mount(chart,source,{responsive:true,zoom:false,fontFamily:'system-ui, sans-serif',fontSize:14,links:false,images:false,idPrefix:`wiki-figure-${i}`,onError(){details.open=true;}});if(mounted.error)throw mounted.error;details.append(block);figure.append(details);figure.dataset.renderer='pele';}
      catch{figure.replaceWith(block);}
    });
  } catch { /* Reading and source code remain available when loading fails. */ }
}

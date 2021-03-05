export const gramm = `
<grammar root="funny_quotes">

   <rule id="funny_quotes">
      <ruleref uri="#quote"/>
      <tag>out.quote = new Object(); out.quote.source=rules.quote.said_by;</tag>
   </rule>

   <rule id="quotes">
      <one-of>
         <item>do be do be do<tag>out="Sinatra";</tag></item>
         <item>to be is to do<tag>out="Sartre";</tag></item>
         <item>to do is to be<tag>out="Socrates";</tag></item>
      </one-of>
   </rule>

   <rule id="quote">
      <ruleref uri="#quotes"/>
      <tag>out.said_by=rules.quotes;</tag>
   </rule>
   
</grammar>
    
`
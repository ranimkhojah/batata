export const grammar = `
<grammar root="home">
    <rule id="home">
        <ruleref uri="#command"/>
        <tag>out.command= new Object(); out.command.object = rules.command.thing; out.command.action = rules.command.todo; </tag>
    </rule>
    <rule id="actions"> 
        <one-of> 
            <item> open </item> 
            <item> close </item> 
        </one-of> 
    </rule>
    <rule id="actions2"> 
        <one-of> 
            <item> on </item> 
            <item> off </item> 
        </one-of> 
    </rule>
   <rule id="objects"> 
        <one-of> 
            <item> window </item> 
            <item> door </item> 
        </one-of> 
    </rule>
    <rule id="objects2"> 
        <one-of> 
            <item> light </item> 
            <item> lights <tag> out = 'light'; </tag></item>
            <item> heat </item> 
            <item> AC <tag> out = 'air conditioning'; </tag></item> 
            <item> A C <tag> out = 'air conditioning'; </tag></item> 
            <item> air conditioning </item> 
        </one-of> 
    </rule>
     
    <rule id="command">
        <item repeat="0-">please</item>
            <one-of> 
                <item>
                    <ruleref uri="#actions"/>
                    <tag>out.todo=rules.actions;</tag>
                    the
                    <ruleref uri="#objects"/>
                    <tag>out.thing=rules.objects;</tag>
                </item> 
                <item>
                    turn
                    <ruleref uri="#actions2"/>
                    <tag>out.todo=rules.actions2;</tag>
                    the
                    <ruleref uri="#objects2"/>
                    <tag>out.thing=rules.objects2;</tag>
                </item> 
                <item>
                    turn the
                    <ruleref uri="#objects2"/>
                    <tag>out.thing=rules.objects2;</tag> 
                    <ruleref uri="#actions2"/>
                    <tag>out.todo=rules.actions2;</tag> 
                </item> 
            </one-of> 
    </rule>
</grammar>
`
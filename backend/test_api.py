(venv) PS E:\2025_chrome_extension\IC-Easy> Invoke-RestMethod -Uri "http://localhost:8000/api/literature/search-all" `
>>   -Method Post `
>>   -ContentType "application/json" `
>>   -Body '{"keyword": "AI", "limit": 5}'

total results
----- -------
   10 {@{title=Additive Hazard Regression Models: An ... 


(venv) PS E:\2025_chrome_extension\IC-Easy> Invoke-RestMethod -Uri "http://localhost:8000/api/history/"
Invoke-RestMethod : {"detail":"Not Found"}
At line:1 char:1
+ Invoke-RestMethod -Uri "http://localhost:8000/api/hist 
ory/"
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
~~~~~
    + CategoryInfo          : InvalidOperation: (System  
   .Net.HttpWebRequest:HttpWebRequest) [Invoke-RestMet   
  hod], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseExcep  
   tion,Microsoft.PowerShell.Commands.InvokeRestMethod   
  Command
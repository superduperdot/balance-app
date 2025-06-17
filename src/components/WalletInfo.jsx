import { useEffect, useState } from 'react';

export default function WalletInfo() {
  const [wallets, setWallets] = useState([]);
  const [primary, setPrimary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [totalBalances, setTotalBalances] = useState({});
  const [showBalanceBreakdown, setShowBalanceBreakdown] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('bearerToken');

  useEffect(() => {
    async function fetchWallets() {
      if (!token) {
        setError('Please authenticate first to view wallet information.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Step 1: Getting account information...');
        
        // First, we need to get the account ID for the authenticated user
        // The OAuth token should give us access to account information
        let currentAccountId = null;
        
        // Try to get account info - this might be at /accounts or /me or similar
        try {
          const accountRes = await fetch('/api/accounts', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (accountRes.ok) {
            const accountData = await accountRes.json();
            console.log('📋 Account response:', accountData);
            console.log('📋 Account response type:', typeof accountData);
            console.log('📋 Account response keys:', Object.keys(accountData || {}));
            
            // Try to find account ID in various possible locations
            let possibleIds = [];
            
            // Check direct properties
            if (accountData.id) possibleIds.push({ source: 'accountData.id', value: accountData.id });
            if (accountData.account_id) possibleIds.push({ source: 'accountData.account_id', value: accountData.account_id });
            if (accountData.accountId) possibleIds.push({ source: 'accountData.accountId', value: accountData.accountId });
            
            // Check if it's an array
            if (Array.isArray(accountData) && accountData.length > 0) {
              const firstAccount = accountData[0];
              if (typeof firstAccount === 'string') {
                // Account ID is directly the string value
                possibleIds.push({ source: 'accountData[0] (string)', value: firstAccount });
              } else if (firstAccount && typeof firstAccount === 'object') {
                if (firstAccount.id) possibleIds.push({ source: 'accountData[0].id', value: firstAccount.id });
                if (firstAccount.account_id) possibleIds.push({ source: 'accountData[0].account_id', value: firstAccount.account_id });
                if (firstAccount.accountId) possibleIds.push({ source: 'accountData[0].accountId', value: firstAccount.accountId });
              }
            }
            
            // Check accounts property (based on the console showing {accounts: Array(1)})
            if (accountData.accounts && Array.isArray(accountData.accounts) && accountData.accounts.length > 0) {
              const firstAccount = accountData.accounts[0];
              if (typeof firstAccount === 'string') {
                // Account ID is directly the string value
                possibleIds.push({ source: 'accountData.accounts[0] (string)', value: firstAccount });
              } else if (firstAccount && typeof firstAccount === 'object') {
                if (firstAccount.id) possibleIds.push({ source: 'accountData.accounts[0].id', value: firstAccount.id });
                if (firstAccount.account_id) possibleIds.push({ source: 'accountData.accounts[0].account_id', value: firstAccount.account_id });
                if (firstAccount.accountId) possibleIds.push({ source: 'accountData.accounts[0].accountId', value: firstAccount.accountId });
              }
            }
            
            // Check data property
            if (accountData.data) {
              if (Array.isArray(accountData.data) && accountData.data.length > 0) {
                const firstDataAccount = accountData.data[0];
                if (typeof firstDataAccount === 'string') {
                  possibleIds.push({ source: 'accountData.data[0] (string)', value: firstDataAccount });
                } else if (firstDataAccount && typeof firstDataAccount === 'object') {
                  if (firstDataAccount.id) possibleIds.push({ source: 'accountData.data[0].id', value: firstDataAccount.id });
                  if (firstDataAccount.account_id) possibleIds.push({ source: 'accountData.data[0].account_id', value: firstDataAccount.account_id });
                  if (firstDataAccount.accountId) possibleIds.push({ source: 'accountData.data[0].accountId', value: firstDataAccount.accountId });
                }
              } else if (accountData.data.id) {
                possibleIds.push({ source: 'accountData.data.id', value: accountData.data.id });
              } else if (accountData.data.account_id) {
                possibleIds.push({ source: 'accountData.data.account_id', value: accountData.data.account_id });
              } else if (accountData.data.accountId) {
                possibleIds.push({ source: 'accountData.data.accountId', value: accountData.data.accountId });
              }
            }
            
            console.log('🔍 Possible account IDs found:', possibleIds);
            
            // Use the first valid ID we find
            if (possibleIds.length > 0) {
              currentAccountId = possibleIds[0].value;
              console.log('✅ Using account ID:', currentAccountId, 'from', possibleIds[0].source);
            } else {
              console.log('❌ Could not find account ID in any expected location');
              console.log('📋 Full account data structure:', JSON.stringify(accountData, null, 2));
            }
          } else {
            console.log('⚠️ /api/accounts returned:', accountRes.status);
          }
        } catch (err) {
          console.log('⚠️ Failed to fetch from /api/accounts:', err.message);
        }

        // If we couldn't get account ID from /accounts, try other endpoints
        if (!currentAccountId) {
          console.log('🔍 Trying alternative endpoints for account ID...');
          
          // Try /me endpoint
          try {
            const meRes = await fetch('/api/me', {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (meRes.ok) {
              const meData = await meRes.json();
              console.log('📋 /me response:', meData);
              if (meData.account_id) {
                currentAccountId = meData.account_id;
              } else if (meData.id) {
                currentAccountId = meData.id;
              }
            }
          } catch (err) {
            console.log('⚠️ /api/me not available');
          }
        }

        if (!currentAccountId) {
          console.log('❌ Could not determine account ID. Falling back to global addresses endpoint.');
          // Fall back to the old approach if we can't get account ID
          const addressesRes = await fetch('/api/addresses', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!addressesRes.ok) {
            throw new Error(`Failed to fetch addresses: ${addressesRes.status} ${addressesRes.statusText}`);
          }

          const addressesData = await addressesRes.json();
          console.log('📦 Global addresses response:', addressesData);

          // Handle different response formats
          let addresses;
          if (Array.isArray(addressesData)) {
            addresses = addressesData;
          } else if (addressesData.data && Array.isArray(addressesData.data)) {
            addresses = addressesData.data;
          } else {
            throw new Error('Invalid response format from addresses API');
          }

          console.log('📋 Global addresses found:', addresses.length);
          
          // Analyze the address types we actually have
          const addressTypes = [...new Set(addresses.map(addr => addr.type))];
          const typeCount = {};
          addresses.forEach(addr => {
            typeCount[addr.type] = (typeCount[addr.type] || 0) + 1;
          });
          
          console.log('🔍 Address types found:', addressTypes);
          console.log('🔍 Address type counts:', typeCount);
          
          // Show first few addresses to understand structure
          if (addresses.length > 0) {
            console.log('🔍 First address sample:', addresses[0]);
            if (addresses.length > 1) {
              console.log('🔍 Second address sample:', addresses[1]);
            }
          }

          // Filter for internal (custodial) wallets only
          const internalAddresses = addresses.filter(addr => addr.type === 'internal');
          console.log(`🏦 Found ${internalAddresses.length} internal (custodial) addresses out of ${addresses.length} total`);

          if (internalAddresses.length === 0) {
            setError(`No internal custodial wallets found. Found ${addresses.length} total addresses, but none are type "internal". Address types found: ${addressTypes.join(', ')}. Check console for details.`);
            return;
          }

          const walletsWithBalances = internalAddresses.map(addr => ({ ...addr, balances: [] }));
          setWallets(walletsWithBalances);

          const primaryWallet = walletsWithBalances.find(w => w.usage === 'primary');
          if (primaryWallet) {
            setPrimary(primaryWallet);
          }

          return;
        }

        console.log('✅ Found account ID:', currentAccountId);
        setAccountId(currentAccountId);

        console.log('🔍 Step 2: Fetching account-scoped addresses...');
        
        // Now fetch addresses scoped to this specific account
        const accountAddressesRes = await fetch(`/api/accounts/${currentAccountId}/addresses`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!accountAddressesRes.ok) {
          throw new Error(`Failed to fetch account addresses: ${accountAddressesRes.status} ${accountAddressesRes.statusText}`);
        }

        const accountAddressesData = await accountAddressesRes.json();
        console.log('📦 Account-scoped addresses response:', accountAddressesData);

        // Handle different response formats
        let addresses;
        if (Array.isArray(accountAddressesData)) {
          addresses = accountAddressesData;
        } else if (accountAddressesData.data && Array.isArray(accountAddressesData.data)) {
          addresses = accountAddressesData.data;
        } else if (accountAddressesData.addresses && Array.isArray(accountAddressesData.addresses)) {
          addresses = accountAddressesData.addresses;
        } else {
          console.error('❌ Unexpected account addresses response format:', accountAddressesData);
          throw new Error('Invalid response format from account addresses API');
        }

        console.log('📋 Account addresses found:', addresses.length);
        
        if (addresses.length > 0) {
          console.log('🔍 First account address structure:', addresses[0]);
          console.log('🔍 Address types found:', [...new Set(addresses.map(addr => addr.type))]);
          
          // Show breakdown of address types
          const typeCount = {};
          addresses.forEach(addr => {
            typeCount[addr.type] = (typeCount[addr.type] || 0) + 1;
          });
          console.log('🔍 Address type counts:', typeCount);
          
          // Show first few addresses of each type
          const internalAddresses = addresses.filter(addr => addr.type === 'internal');
          const externalAddresses = addresses.filter(addr => addr.type === 'externally-owned');
          const otherAddresses = addresses.filter(addr => addr.type !== 'internal' && addr.type !== 'externally-owned');
          
          console.log(`📊 Internal addresses: ${internalAddresses.length}`);
          console.log(`📊 Externally-owned addresses: ${externalAddresses.length}`);
          console.log(`📊 Other address types: ${otherAddresses.length}`);
          
          if (internalAddresses.length > 0) {
            console.log('🏦 Sample Internal address:', internalAddresses[0]);
          }
          if (externalAddresses.length > 0) {
            console.log('🔗 Sample Externally-owned address:', externalAddresses[0]);
          }
          if (otherAddresses.length > 0) {
            console.log('❓ Sample Other address:', otherAddresses[0]);
          }
        }

        // Filter for internal (custodial) wallets
        const custodialAddresses = addresses.filter(addr => addr.type === 'internal');
        console.log(`🏦 Found ${custodialAddresses.length} custodial addresses in account ${currentAccountId}`);

        if (custodialAddresses.length === 0) {
          setError(`No custodial wallets found for account ${currentAccountId}. Found ${addresses.length} total addresses. Check console for details.`);
          return;
        }

        // Fetch balances for each custodial address
        console.log('🔍 Step 3: Fetching balances for custodial addresses...');
        const walletsWithBalances = await Promise.all(
          custodialAddresses.map(async (addr) => {
            const balances = [];
            
            // For each transfer type, fetch the balance
            if (addr.transfer_types && addr.transfer_types.length > 0) {
              for (const transferType of addr.transfer_types) {
                try {
                  console.log(`💰 [OPTIMIZED] Fetching balance for address ${addr.id} on ${transferType}...`);
                  
                  // Try all supported stablecoin value types
                  const valueTypes = [
                    'SBC', 'USDGLO', '4MGCC', 'BCOA', 'BeamUSD', 'COMET', 'DZUSD', 
                    'EasyUSD', 'GBUSDC', 'HSUSD', 'KCD', 'LIMUSD', 'MFUSD', 'MOVEUSD', 
                    'MXkle', 'OUSD', 'PiUSD', 'SAGEUSD', 'USC', 'USD+', 'USDBI', 
                    'USDBanxa', 'USDdollr', 'USDF', 'USDS', 'USDSlash', 'USDOKA', 
                    'USDTN', 'USDY', 'XODUS', 'XPED', 'YOGUSD', 'etUSD', 'decent', 
                    'hodl', 'PUSD', 'RainUSD', 'USDCi', 'USDP'
                  ];
                  
                  for (const valueType of valueTypes) {
                    const balanceRes = await fetch(
                      `/api/accounts/${currentAccountId}/addresses/${addr.id}/balance?transfer_type=${transferType}&value_type=${valueType}`,
                      {
                        headers: { 
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      }
                    );

                    if (balanceRes.ok) {
                      const balanceData = await balanceRes.json();
                      console.log(`💰 Balance for ${addr.id} on ${transferType} with value_type=${valueType}:`, balanceData);
                      balances.push({
                        transfer_type: transferType,
                        value_type: valueType,
                        ...balanceData
                      });
                    } else {
                      console.log(`⚠️ Balance fetch failed for ${addr.id} on ${transferType} with value_type=${valueType}: ${balanceRes.status}`);
                    }
                  }
                } catch (err) {
                  console.log(`❌ Error fetching balance for ${addr.id} on ${transferType}:`, err.message);
                }
              }
            }
            
            return { 
              ...addr, 
              balances
            };
          })
        );

        setWallets(walletsWithBalances);
        
        // Calculate total balances across all wallets
        const totalBalances = {};
        walletsWithBalances.forEach(wallet => {
          wallet.balances.forEach(balance => {
            if (balance.balance && balance.balance.value) {
              const amount = parseFloat(balance.balance.value);
              const valueType = balance.value_type;
              if (!totalBalances[valueType]) {
                totalBalances[valueType] = 0;
              }
              totalBalances[valueType] += amount;
            }
          });
        });
        
        console.log('💰 Total balances calculated:', totalBalances);
        setTotalBalances(totalBalances);
        
        // Find the primary wallet
        const primaryWallet = walletsWithBalances.find(w => w.usage === 'primary');
        if (primaryWallet) {
          setPrimary(primaryWallet);
          console.log('🌟 Found primary custodial wallet:', primaryWallet);
        } else {
          console.log('⚠️ No primary custodial wallet found');
        }

      } catch (err) {
        console.error('❌ Error fetching wallets:', err);
        setError(`Failed to load wallet information: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchWallets();
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Wallet Information</h2>
        <p style={{ color: '#666' }}>Please authenticate first to view your wallet information.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Wallet Information</h2>
        <p>Loading wallet information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Wallet Information</h2>
        <div style={{
          padding: '10px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff9999',
          borderRadius: '4px',
          color: '#cc0000',
          marginTop: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        Wallet Information
      </h2>

      {accountId && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f8ff',
          border: '1px solid #0066cc',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Account ID:</strong> <code>{accountId}</code>
        </div>
      )}

      {/* Total Balances Section - Collapsible */}
      {Object.keys(totalBalances).length > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff9e6',
          border: '2px solid #ffa500',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div 
            onClick={() => setShowBalanceBreakdown(!showBalanceBreakdown)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: showBalanceBreakdown ? '15px' : '0'
            }}
          >
            <h3 style={{ color: '#e67e00', margin: '0' }}>
              💰 Total Balance
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#e67e00',
                fontFamily: 'monospace'
              }}>
                ${Object.values(totalBalances).reduce((sum, val) => sum + val, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
              <div style={{
                fontSize: '18px',
                color: '#e67e00',
                transform: showBalanceBreakdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </div>
            </div>
          </div>
          
          {showBalanceBreakdown && (
            <>
              <div style={{ 
                height: '1px', 
                backgroundColor: '#ffa500', 
                margin: '15px 0',
                opacity: 0.3
              }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                {Object.entries(totalBalances)
                  .sort(([,a], [,b]) => b - a) // Sort by value descending
                  .filter(([,total]) => total > 0) // Only show non-zero balances
                  .map(([valueType, total]) => (
                    <div key={valueType} style={{
                      padding: '12px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #ffa500',
                      borderRadius: '6px',
                      textAlign: 'center',
                      minWidth: '120px'
                    }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#e67e00',
                        fontFamily: 'monospace'
                      }}>
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        fontWeight: '500',
                        marginTop: '4px'
                      }}>
                        {valueType?.toUpperCase() || 'USD'}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
          
          <div style={{ 
            marginTop: '15px', 
            textAlign: 'center', 
            fontSize: '14px', 
            color: '#666',
            fontStyle: 'italic'
          }}>
            {showBalanceBreakdown ? `Breakdown across all ${wallets.length} custodial wallets` : `Total across all ${wallets.length} custodial wallets • Click to expand`}
          </div>
        </div>
      )}

      {/* Primary Custodial Wallet Section */}
      {primary && (
        <div style={{
          padding: '20px',
          backgroundColor: '#e8f5e8',
          border: '2px solid #28a745',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#28a745', marginTop: '0', marginBottom: '15px' }}>
            🌟 Primary Custodial Wallet
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <p><strong>Address ID:</strong> <code>{primary.id}</code></p>
            <p><strong>Networks:</strong> {
              primary.transfer_types && primary.transfer_types.length > 0 
                ? primary.transfer_types.map(type => 
                    type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace(/_/g, ' ')
                  ).join(', ')
                : primary.network || 'Not specified'
            }</p>
            <p><strong>Blockchain Address:</strong> <code style={{
              wordBreak: 'break-all',
              fontSize: '14px',
              backgroundColor: '#f8f9fa',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>{primary.address || primary.wallet_address || primary.blockchain_address || primary.public_address || 'Not available'}</code></p>
            <p><strong>Type:</strong> {primary.type}</p>
            <p><strong>Usage:</strong> {primary.usage || 'Not specified'}</p>
            <p><strong>Description:</strong> {primary.description || '(No description)'}</p>
            
            {/* Primary Wallet Balances */}
            {primary.balances && primary.balances.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <strong>Balances:</strong>
                <div style={{ marginTop: '8px' }}>
                  {/* Group balances by transfer_type */}
                  {Object.entries(
                    primary.balances.reduce((acc, balance) => {
                      const key = balance.transfer_type;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(balance);
                      return acc;
                    }, {})
                  ).map(([transferType, balances]) => (
                    <div key={transferType} style={{
                      padding: '8px 12px',
                      backgroundColor: '#f8fff8',
                      border: '1px solid #c3e6cb',
                      borderRadius: '4px',
                      marginBottom: '6px'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {transferType?.charAt(0).toUpperCase() + transferType?.slice(1).toLowerCase().replace(/_/g, ' ')}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {balances.map((balance, idx) => (
                          <span key={idx} style={{ 
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            color: '#155724',
                            fontWeight: 'bold'
                          }}>
                            ${balance.balance?.value || '0'} {balance.value_type?.toUpperCase() || 'USD'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Custodial Wallets Section */}
      <h3 style={{ color: '#333', marginBottom: '20px' }}>
        All Custodial Wallets ({wallets.length})
      </h3>

      {wallets.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', fontStyle: 'italic' }}>
          No custodial wallets found.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {wallets.map((wallet, index) => (
            <div key={wallet.id || index} style={{
              padding: '20px',
              border: wallet.usage === 'primary' ? '2px solid #28a745' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: wallet.usage === 'primary' ? '#f8fff8' : '#ffffff'
            }}>
              {wallet.usage === 'primary' && (
                <div style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '15px'
                }}>
                  PRIMARY
                </div>
              )}
              
              <div style={{ display: 'grid', gap: '10px' }}>
                <p><strong>Description:</strong> {wallet.description || '(No description)'}</p>
                <p><strong>Networks:</strong> {
                  wallet.transfer_types && wallet.transfer_types.length > 0 
                    ? wallet.transfer_types.map(type => 
                        type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace(/_/g, ' ')
                      ).join(', ')
                    : wallet.network || 'Not specified'
                }</p>
                <p><strong>Type:</strong> <span style={{
                  padding: '2px 6px',
                  backgroundColor: wallet.type === 'internal' ? '#d4edda' : '#f8d7da',
                  color: wallet.type === 'internal' ? '#155724' : '#721c24',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}>{wallet.type}</span></p>
                <p><strong>Address ID:</strong> <code>{wallet.id}</code></p>
                <p><strong>Blockchain Address:</strong> <code style={{
                  wordBreak: 'break-all',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>{wallet.address || wallet.wallet_address || wallet.blockchain_address || wallet.public_address || 'Not available'}</code></p>
                <p><strong>Usage:</strong> {wallet.usage || 'Not specified'}</p>

                {/* Balances */}
                {wallet.balances && wallet.balances.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <strong>Balances:</strong>
                    <div style={{ marginTop: '8px', paddingLeft: '10px' }}>
                      {/* Group balances by transfer_type */}
                      {Object.entries(
                        wallet.balances.reduce((acc, balance) => {
                          const key = balance.transfer_type;
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(balance);
                          return acc;
                        }, {})
                      ).map(([transferType, balances]) => (
                        <div key={transferType} style={{
                          padding: '8px 12px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          borderRadius: '4px',
                          marginBottom: '6px'
                        }}>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {transferType?.charAt(0).toUpperCase() + transferType?.slice(1).toLowerCase().replace(/_/g, ' ')}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {balances.map((balance, idx) => (
                              <span key={idx} style={{ 
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                color: '#28a745',
                                fontWeight: 'bold'
                              }}>
                                ${balance.balance?.value || '0'} {balance.value_type?.toUpperCase() || 'USD'}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debug info - show all fields */}
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', color: '#666' }}>🔍 Debug: All fields</summary>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(wallet, null, 2)}
                  </pre>
                </details>


              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 